import { BrevitaResponse, HistoryItem } from '../types';
import { db } from './db';

const LEGACY_STORAGE_KEY = 'brevita_history';

export const historyService = {
  /**
   * Initializes the history service.
   * Migrates data from localStorage to IndexedDB if found.
   * Returns true if migration was performed.
   */
  init: async (): Promise<boolean> => {
    try {
      const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyData) {
        console.log("Migrating legacy history to Local Backend...");
        const items: HistoryItem[] = JSON.parse(legacyData);
        
        // Migrate all items to DB
        for (const item of items) {
          await db.addBriefing(item);
        }
        
        // Clear legacy storage
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        console.log("Migration complete.");
        return true;
      }
      return false;
    } catch (e) {
      console.error("Migration failed:", e);
      return false;
    }
  },

  save: async (data: BrevitaResponse): Promise<HistoryItem> => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data,
    };
    
    await db.addBriefing(newItem);
    return newItem;
  },

  getAll: async (): Promise<HistoryItem[]> => {
    return await db.getAllBriefings();
  },

  delete: async (id: string): Promise<void> => {
    await db.deleteBriefing(id);
  },

  clear: async (): Promise<void> => {
    await db.clearAll();
  }
};