import { create } from 'zustand';
import { IPC_CHANNELS } from '@shared/constants';
import type { SearchRequest, SearchResponse } from '@shared/types';

interface SearchState {
  query: string;
  result: SearchResponse[];
  loading: boolean;
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
}

declare global {
  interface Window {
    ipcRenderer?: {
      invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    };
  }
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  result: [],
  loading: false,
  setQuery: (query: string) => set({ query }),
  search: async (query?: string) => {
    set({ loading: true });
    try {
      const q = query ?? get().query;
      const ipcRenderer = window.ipcRenderer;
      if (!ipcRenderer) throw new Error('ipcRenderer not found');
      const req: SearchRequest = { query: q };
      const result = (await ipcRenderer.invoke(
        IPC_CHANNELS.QUERY_FROM_NL,
        req
      )) as SearchResponse[];
      set({ result, loading: false });
    } catch (error) {
      console.error('Search error:', error);
      set({ result: [], loading: false });
    }
  },
}));
