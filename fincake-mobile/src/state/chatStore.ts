import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  clusterId?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isSending: boolean;
  prefillQuestion: string | null;
  prefillClusterId: string | null;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setSending: (sending: boolean) => void;
  clearMessages: () => void;
  setPrefill: (question: string, clusterId?: string) => void;
  clearPrefill: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isSending: false,
  prefillQuestion: null,
  prefillClusterId: null,
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { 
      ...message, 
      id: Date.now().toString(), 
      timestamp: Date.now() 
    }]
  })),
  setSending: (sending) => set({ isSending: sending }),
  clearMessages: () => set({ messages: [] }),
  setPrefill: (question, clusterId) => set({ 
    prefillQuestion: question, 
    prefillClusterId: clusterId || null 
  }),
  clearPrefill: () => set({ 
    prefillQuestion: null, 
    prefillClusterId: null 
  }),
  setMessages: (messages) => set({ messages }),
}));
