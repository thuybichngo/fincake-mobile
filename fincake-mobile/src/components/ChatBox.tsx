import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useChat } from '../hooks/useChat';
import { useChatStore } from '../state/chatStore';

export default function ChatBox() {
  const { send, error } = useChat();
  const { prefillQuestion, addMessage, messages, isSending } = useChatStore();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (prefillQuestion) setInput(prefillQuestion);
  }, [prefillQuestion]);

  const onSend = () => {
    const text = input.trim();
    if (!text) return;
    // Optimistic append user message bubble immediately
    addMessage({ role: 'user', content: text });
    void send(text);
    setInput('');
  };

  return (
    <View style={styles.container}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Hỏi AI về thị trường..."
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={onSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={onSend} style={[styles.sendBtn, isSending && { opacity: 0.6 }]} disabled={isSending} accessibilityRole="button" accessibilityLabel="Gửi câu hỏi AI">
          <Text style={styles.sendText}>{isSending ? 'Đang gửi...' : 'Gửi'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.meta}>Msgs: {messages.length}{messages.length ? ` | Last: ${messages[messages.length-1].role}` : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, minHeight: 40, maxHeight: 120, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10 },
  sendBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  sendText: { color: '#fff', fontWeight: '600' },
  error: { color: '#ef4444', marginBottom: 6 },
  meta: { color: '#9ca3af', marginTop: 6, fontSize: 12, textAlign: 'right' },
});


