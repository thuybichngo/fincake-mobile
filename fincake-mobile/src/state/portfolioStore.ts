import { create } from 'zustand';
import type { PortfolioItem } from '../types/portfolio';
import { portfolioStorage } from '../lib/storage';

interface PortfolioState {
  items: PortfolioItem[];
  addItem: (item: Omit<PortfolioItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Omit<PortfolioItem, 'id'>>) => void;
  removeItem: (id: string) => void;
  clearPortfolio: () => void;
  setPortfolio: (items: PortfolioItem[]) => void;
  loadFromStorage: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const nextItems = [...state.items, { ...item, id: Date.now().toString() }];
    void portfolioStorage.set(nextItems);
    return { items: nextItems };
  }),
  updateItem: (id, updates) => set((state) => {
    const nextItems = state.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    void portfolioStorage.set(nextItems);
    return { items: nextItems };
  }),
  removeItem: (id) => set((state) => {
    const nextItems = state.items.filter(item => item.id !== id);
    void portfolioStorage.set(nextItems);
    return { items: nextItems };
  }),
  clearPortfolio: () => {
    void portfolioStorage.clear();
    set({ items: [] });
  },
  setPortfolio: (items) => {
    void portfolioStorage.set(items);
    set({ items });
  },
  loadFromStorage: async () => {
    const saved = await portfolioStorage.get();
    if (saved && Array.isArray(saved)) {
      set({ items: saved as PortfolioItem[] });
    }
  },
}));
