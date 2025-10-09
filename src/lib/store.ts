import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  // Whether the server reports a valid Gmail OAuth connection
  hasValidGmailAuth?: boolean;
  // Deprecated: previously used to gate UI; prefer hasValidGmailAuth
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

interface ThreadMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body?: string;
  htmlBody?: string;
  timestamp: string | Date;
  isUnread: boolean;
}

interface EmailThread {
  id: string;
  gmailId: string;
  subject: string;
  messages: ThreadMessage[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AppState {
  user: User | null;
  emails: Email[];
  selectedEmail: Email | null;
  selectedThread: EmailThread | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setEmails: (emails: Email[]) => void;
  setSelectedEmail: (email: Email | null) => void;
  setSelectedThread: (thread: EmailThread | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  emails: [],
  selectedEmail: null,
  selectedThread: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setEmails: (emails) => set({ emails }),
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  setSelectedThread: (thread) => set({ selectedThread: thread }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
