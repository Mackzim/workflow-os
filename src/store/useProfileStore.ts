/**
 * Profile State (persisted, local)
 * --------------------------------
 * Local nickname override for the greeting. For signed-in users the authoritative
 * nickname also lives in Supabase user_metadata (set via useProfile), so it
 * follows the account across devices; this store is the local cache + the value
 * used in local (no-auth) mode.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/storage';
import { STORAGE_PREFIX } from '@/config/app';

interface ProfileState {
  nickname: string | null;
  setNickname: (value: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      nickname: null,
      setNickname: (value) => set({ nickname: value && value.trim() ? value.trim() : null }),
    }),
    {
      name: `${STORAGE_PREFIX}.profile`,
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
