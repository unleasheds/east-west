import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TripRequest, UserProfile, SearchState, ToastState } from '../types';

interface StoreState {
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  trips: TripRequest[];
  addTrip: (trip: Omit<TripRequest, 'id' | 'createdAt' | 'status'>) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  search: SearchState;
  setSearch: (s: Partial<SearchState>) => void;
  clearSearch: () => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  toast: ToastState;
  showToast: (message: string, type?: ToastState['type']) => void;
}

export const useStore = create<StoreState>()(
  persist<StoreState>(
    (set, get) => ({
      savedIds: [],
      toggleSave: (id: string) => {
        const prev = get().savedIds;
        const alreadySaved = prev.includes(id);
        set({ savedIds: alreadySaved ? prev.filter((x) => x !== id) : [...prev, id] });
        get().showToast(alreadySaved ? 'Removed from wishlist' : 'Saved to wishlist', 'success');
      },
      isSaved: (id: string) => get().savedIds.includes(id),

      trips: [],
      addTrip: (trip: Omit<TripRequest, 'id' | 'createdAt' | 'status'>) => {
        const newTrip: TripRequest = {
          ...trip,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((s) => ({ trips: [newTrip, ...s.trips] }));
      },

      profile: { name: '', phone: '', email: '', familySize: '', budget: '', preferences: '' },
      setProfile: (p: UserProfile) => set({ profile: p }),

      search: { destination: '', dates: '', travellers: '' },
      setSearch: (s: Partial<SearchState>) =>
        set((prev) => ({ search: { ...prev.search, ...s } })),
      clearSearch: () =>
        set({ search: { destination: '', dates: '', travellers: '' }, activeCategory: 'All' }),

      activeCategory: 'All',
      setActiveCategory: (c: string) => set({ activeCategory: c }),

      toast: { message: '', visible: false, type: 'default' },
      showToast: (message: string, type: ToastState['type'] = 'default') => {
        set({ toast: { message, visible: true, type } });
        setTimeout(
          () => set((s) => ({ toast: { ...s.toast, visible: false } })),
          2000
        );
      },
    }),
    {
      name: 'ew-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedIds: state.savedIds,
        trips: state.trips,
        profile: state.profile,
      }) as StoreState,
    }
  )
);
