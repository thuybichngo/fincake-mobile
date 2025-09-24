import { useState, useCallback, useEffect } from 'react';
import { chatStorage } from '../lib/storage';
import { useChatStore } from '../state/chatStore';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function useChat() {
  const { messages, addMessage, setMessages, setSending, prefillQuestion, prefillClusterId, clearPrefill } = useChatStore();
  const [error, setError] = useState<string | null>(null);

  // hydrate last logs
  useEffect(() => {
    (async () => {
      const logs = await chatStorage.get();
      if (logs && Array.isArray(logs) && logs.length > 0) {
        setMessages(logs as any);
      }
    })();
  }, [setMessages]);

  const send = useCallback(async (input: string) => {
    setError(null);
    setSending(true);

    const payload: { message: string; cluster_id?: string } = {
      message: input,
    };
    if (prefillClusterId) payload.cluster_id = prefillClusterId;

    // user bubble will be appended optimistically by ChatBox

    try {
      const functionsUrl = process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL || 'https://fwcktzrwaazlzxstbnbp.functions.supabase.co';
      const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3Y2t0enJ3YWF6bHp4c3RibmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODY0ODcsImV4cCI6MjA3NDI2MjQ4N30.o8dnVeL_2YR9BhV_oFscgBDizgdjs61jfOMHkcPiCyE';

      const res = await fetch(`${functionsUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.answer ?? String(data) };
      // append assistant message
      addMessage(assistantMsg as any);
      // Persist last 10 (read latest from store after updates)
      const latest = [...useChatStore.getState().messages];
      void chatStorage.set(latest.slice(-10));
    } catch (e: any) {
      setError(e?.message ?? 'Gửi tin nhắn thất bại');
    } finally {
      setSending(false);
      clearPrefill();
    }
  }, [messages, prefillClusterId, setMessages, setSending, clearPrefill]);

  return { messages, send, error };
}


