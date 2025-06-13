import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  NICHE_TITLE: "sitespark.niche_title",
  TOP_PICKS: "sitespark.top_picks",
  SELECTED_TEMPLATE: "sitespark.selected_template",
};

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
      throw error;
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
      throw error;
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const keyPromises = keys.map(key => AsyncStorage.removeItem(key));
      await Promise.all(keyPromises);
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  },
};

export default storage;