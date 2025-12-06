import { BrevitaResponse, HistoryItem } from '../types';
import { db } from './db';
import { supabase, isConfigured } from './supabase';

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

    // 1. Try Supabase if logged in AND configured
    if (user && isConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('briefings')
          .insert({
            user_id: user.id,
            data: data
          })
          .select()
          .single();

        if (error) throw error;

        // Also save text locally for offline cache if desired, but for now just return cloud result
        return {
          id: inserted.id,
          timestamp: new Date(inserted.created_at).getTime(),
          data: inserted.data,
          pinned: inserted.is_pinned || false // Assuming potential column, otherwise false
        };
      } catch (err) {
        console.error("Supabase save failed, falling back to local:", err);
        // Fallback to local
      }
    }

    // 2. Local Fallback (or default if no user)
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data,
      pinned: false
    };

    try {
      await db.addBriefing(newItem);
    } catch (localErr) {
      console.error("Local save failed:", localErr);
      throw new Error("Failed to save briefing to both Cloud and Local storage.");
    }

    return newItem;
  },

  getAll: async (): Promise<HistoryItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isConfigured) {
      try {
        const { data, error } = await supabase
          .from('briefings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((row: any) => ({
          id: row.id,
          timestamp: new Date(row.created_at).getTime(),
          data: row.data,
          pinned: row.is_pinned || false
        }));
      } catch (err) {
        console.error("Supabase fetch failed, falling back to local cache:", err);
        // Consider alerting the user here if needed
      }
    }

    // Fallback to local
    return await db.getAllBriefings();
  },

  delete: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isConfigured) {
      try {
        const { error } = await supabase
          .from('briefings')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return;
      } catch (err) {
        console.error("Supabase delete failed:", err);
        // Fallback to try deleting locally just in case
      }
    }

    await db.deleteBriefing(id);
  },

  clear: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isConfigured) {
      try {
        // Only delete user's own rows due to RLS
        const { error } = await supabase
          .from('briefings')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;
        return;
      } catch (err) {
        console.error("Supabase clear failed:", err);
      }
    }

    await db.clearAll();
  },

  updatePin: async (id: string, pinned: boolean): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isConfigured) {
      try {
        const { error } = await supabase
          .from('briefings')
          .update({ is_pinned: pinned })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error("Supabase pin update failed:", err);
      }
    }

    // Always update local for offline capability
    await db.updateBriefing(id, { pinned });
  },

  updateTriageStatus: async (id: string, status: 'new' | 'review' | 'closed'): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isConfigured) {
      try {
        const { error } = await supabase
          .from('briefings')
          .update({ triage_status: status })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error("Supabase triage update failed:", err);
      }
    }

    // Always update local for offline capability
    await db.updateBriefing(id, { triage_status: status });
  }
};