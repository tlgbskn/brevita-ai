import { BrevitaResponse, HistoryItem } from '../types';
import { db } from './db';
import { supabase } from './supabase';

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
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: inserted, error } = await supabase
        .from('briefings')
        .insert({
          user_id: user.id,
          data: data
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase save error:", error);
        throw error;
      }

      return {
        id: inserted.id,
        timestamp: new Date(inserted.created_at).getTime(),
        data: inserted.data
      };
    }

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data,
    };

    await db.addBriefing(newItem);
    return newItem;
  },

  getAll: async (): Promise<HistoryItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error);
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        timestamp: new Date(row.created_at).getTime(),
        data: row.data
      }));
    }

    return await db.getAllBriefings();
  },

  delete: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('briefings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return;
    }

    await db.deleteBriefing(id);
  },

  clear: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Only delete user's own rows due to RLS
      const { error } = await supabase
        .from('briefings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all matching RLS

      if (error) throw error;
      return;
    }

    await db.clearAll();
  }
};