import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys with namespacing
const STORAGE_KEYS = {
  PORTFOLIO: '@fincake_portfolio',
  CHAT_LOGS: '@fincake_chat_logs',
  UI_STATE: '@fincake_ui_state',
} as const;

// Generic storage functions
export const storage = {
  // Get item from storage
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  // Set item in storage
  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  },

  // Remove item from storage
  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  },

  // Clear all app data
  async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      return true;
    } catch (error) {
      console.error('Error clearing all storage:', error);
      return false;
    }
  },
};

// Specific storage functions for each data type
export const portfolioStorage = {
  async get(): Promise<any[] | null> {
    return storage.getItem(STORAGE_KEYS.PORTFOLIO);
  },
  async set(items: any[]): Promise<boolean> {
    return storage.setItem(STORAGE_KEYS.PORTFOLIO, items);
  },
  async clear(): Promise<boolean> {
    return storage.removeItem(STORAGE_KEYS.PORTFOLIO);
  },
};

export const chatStorage = {
  async get(): Promise<any[] | null> {
    return storage.getItem(STORAGE_KEYS.CHAT_LOGS);
  },
  async set(logs: any[]): Promise<boolean> {
    return storage.setItem(STORAGE_KEYS.CHAT_LOGS, logs);
  },
  async clear(): Promise<boolean> {
    return storage.removeItem(STORAGE_KEYS.CHAT_LOGS);
  },
};

export const uiStorage = {
  async get(): Promise<any | null> {
    return storage.getItem(STORAGE_KEYS.UI_STATE);
  },
  async set(state: any): Promise<boolean> {
    return storage.setItem(STORAGE_KEYS.UI_STATE, state);
  },
  async clear(): Promise<boolean> {
    return storage.removeItem(STORAGE_KEYS.UI_STATE);
  },
};
