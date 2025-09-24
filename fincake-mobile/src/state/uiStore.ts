import { create } from 'zustand';

interface UIState {
  activeTab: 'FinCakeAI' | 'ThiTruong';
  isLoading: boolean;
  error: string | null;
  setActiveTab: (tab: 'FinCakeAI' | 'ThiTruong') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'FinCakeAI',
  isLoading: false,
  error: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
