import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
export const STORAGE_KEYS = {
  NICHE_TITLE: 'sitespark_niche_title',
  TOP_PICKS: 'sitespark_top_picks',
};

// Storage interface that works on both web and native
const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(key, value);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      const value = localStorage.getItem(key);
      return Promise.resolve(value);
    } else {
      return AsyncStorage.getItem(key);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    } else {
      return AsyncStorage.removeItem(key);
    }
  },
  
  clear: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.clear();
      return Promise.resolve();
    } else {
      return AsyncStorage.clear();
    }
  }
};

export default storage;