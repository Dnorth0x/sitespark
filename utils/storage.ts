import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
export const STORAGE_KEYS = {
  NICHE_TITLE: 'sitespark_niche_title',
  TOP_PICKS: 'sitespark_top_picks',
  PRIMARY_COLOR: 'sitespark_primary_color',
  SECONDARY_COLOR: 'sitespark_secondary_color',
  INCLUDE_BRANDING: 'sitespark_include_branding',
  SELECTED_TEMPLATE: 'sitespark_selected_template',
  PEXELS_API_KEY: 'sitespark_pexels_api_key',
  APP_PASSWORD: 'sitespark_app_password',
} as const;

// Storage interface
interface Storage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// Web storage implementation
const webStorage: Storage = {
  getItem: async (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  },
};

// Mobile storage implementation
const mobileStorage: Storage = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
};

// Export the appropriate storage based on platform
const storage = Platform.select({
  web: webStorage,
  default: mobileStorage,
});

export default storage;