import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken?: string;
}

interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  isUnread: boolean;
}

interface AppState {
  user: User | null;
  emails: Email[];
  selectedEmail: Email | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setEmails: (emails: Email[]) => void;
  setSelectedEmail: (email: Email | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  emails: [],
  selectedEmail: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setEmails: (emails) => set({ emails }),
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
