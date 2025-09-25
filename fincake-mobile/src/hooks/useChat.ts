import { useState, useCallback, useEffect } from 'react';
import { chatStorage } from '../lib/storage';
import { useChatStore } from '../state/chatStore';
import { buildBeUrl, FINCAKE_BE_URL } from '../constants/env';

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

    // Build payload expected by BE: { messages: [{role, content}, ...] }
    // Align with web behavior: send only the current message
    const payload = { messages: [{ role: 'user', content: input }] } as const;

    try {
      if (!FINCAKE_BE_URL) {
        throw new Error('Chưa cấu hình FINCAKE_BE_URL');
      }

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
      const res = await fetch(buildBeUrl('/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'x-timezone': tz,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${t}`);
      }

      // Helper: format big numbers for readability (grouping, <=2 decimals)
      const formatNumbersInText = (text: string): string => {
        const formatNumberVi = (num: number): string => {
          const isInteger = Math.abs(num % 1) < 1e-12;
          const fixed = isInteger ? Math.round(num).toString() : num.toFixed(2);
          let [intPart, decPart] = fixed.split('.') as [string, string | undefined];
          intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          if (!decPart) return intPart;
          decPart = decPart.replace(/0+$/, '');
          return decPart.length ? `${intPart},${decPart}` : intPart;
        };

        return text.replace(/(?<![\w.])(\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,](\d+))?/g, (m) => {
          // Skip likely years (1900-2100) and small integers under 10000
          const raw = m.replace(/[.,]/g, '');
          const asInt = Number(raw);
          if (Number.isInteger(asInt)) {
            if (asInt >= 1900 && asInt <= 2100) return m; // year
            if (asInt < 10000) return m; // small numbers like counts or ordinal numbers
          }
          // Normalize decimal separator to dot for parsing
          const normalized = m.replace(/\./g, '').replace(/,/g, '.');
          const num = Number(normalized);
          if (!isFinite(num)) return m;
          return formatNumberVi(num);
        });
      };

      // Fallback path for RN fetch without streaming: read full text and parse
      if (!res.body) {
        const text = await res.text();
        let assistantText = '';
        const lines = text.split(/\r?\n/);
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;
          const jsonStr = line.replace(/^data:\s?/, '');
          if (!jsonStr) continue;
          try {
            const evt = JSON.parse(jsonStr) as { type?: string; content?: any };
            const type = (evt.type || '').toString().toLowerCase();
            if (type === 'message' && typeof evt.content === 'string') {
              assistantText += evt.content;
            }
          } catch {}
        }
        if (assistantText) {
          const displayText = formatNumbersInText(assistantText);
          addMessage({ role: 'assistant', content: displayText } as any);
          const latest = [...useChatStore.getState().messages];
          void chatStorage.set(latest.slice(-10));
        }
        return;
      }

      // Parse SSE stream and accumulate assistant response (streaming path)
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let assistantText = '';
      let appendedAssistant = false;

      // Read chunks until stream ends
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Support both \n\n and \r\n\r\n as frame separators
        let sepIndex: number;
        const separator = buffer.indexOf('\n\n') !== -1 ? '\n\n' : (buffer.indexOf('\r\n\r\n') !== -1 ? '\r\n\r\n' : '');
        if (!separator) continue;
        // eslint-disable-next-line no-cond-assign
        while ((sepIndex = buffer.indexOf(separator)) !== -1) {
          const frame = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + separator.length);

          // Only handle lines starting with "data: "
          const lines = frame.split(/\r?\n/);
          for (const lineRaw of lines) {
            const trimmed = lineRaw.trim();
            if (!trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.replace(/^data:\s?/, '');
            if (!jsonStr) continue;
            try {
              const evt = JSON.parse(jsonStr) as { type?: string; content?: any };
              const type = (evt.type || '').toString().toLowerCase();
              if (type === 'message' && typeof evt.content === 'string') {
                assistantText += evt.content;
                const displayText = formatNumbersInText(assistantText);
                if (!appendedAssistant) {
                  // append assistant bubble on first chunk
                  addMessage({ role: 'assistant', content: displayText } as any);
                  appendedAssistant = true;
                } else {
                  // update last assistant message with the accumulated text
                  const current = [...useChatStore.getState().messages];
                  if (current.length > 0) {
                    const lastIdx = current.length - 1;
                    const last = current[lastIdx];
                    current[lastIdx] = { ...last, content: displayText } as any;
                    setMessages(current as any);
                  }
                }
              } else if (type === 'error') {
                throw new Error(typeof evt.content === 'string' ? evt.content : 'Đã có lỗi xảy ra');
              } else if (type === 'done') {
                // finalize on explicit done
                break;
              }
            } catch (err) {
              // ignore malformed frames, continue streaming
            }
          }
        }
      }

      // Append assistant message at the end (minimal UI change)
      if (assistantText) {
        const assistantMsg: ChatMessage = { role: 'assistant', content: assistantText };
        addMessage(assistantMsg as any);
      }

      // Persist last 10 messages
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


