import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  // Whether the server reports a valid Gmail OAuth connection
  hasValidGmailAuth?: boolean;
  needsGmailAuth?: boolean;
  needsOnboarding?: boolean;
  onboardingStatus?: string;
  redirectToInbox?: boolean;
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
  snippet?: string;
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
  suggestedReplies: Record<
    string,
    { content: string; tone?: string; createdAt: string }
  >;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setEmails: (emails: Email[]) => void;
  setSelectedEmail: (email: Email | null) => void;
  setSelectedThread: (thread: EmailThread | null) => void;
  setSuggestedReply: (
    threadId: string,
    payload: { content: string; tone?: string; createdAt: string } | null
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateThread: (thread: EmailThread) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  emails: [],
  selectedEmail: null,
  selectedThread: null,
  suggestedReplies: {},
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setEmails: (emails) => set({ emails }),
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  setSelectedThread: (thread) => set({ selectedThread: thread }),
  setSuggestedReply: (threadId, payload) =>
    set((state) => {
      const next = { ...state.suggestedReplies };
      if (payload) next[threadId] = payload;
      else delete next[threadId];
      return { suggestedReplies: next };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  updateThread: (thread) =>
    set((state) => {
      const latest = thread.messages[thread.messages.length - 1];
      const updatedEmails = state.emails.map((email) => {
        if (email.threadId !== thread.id || !latest) {
          return email;
        }

        const rawSnippet =
          latest.snippet ||
          (latest.body
            ? latest.body
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
            : "");

        const timestamp =
          typeof latest.timestamp === "string"
            ? latest.timestamp
            : latest.timestamp instanceof Date
            ? latest.timestamp.toISOString()
            : new Date().toISOString();

        return {
          ...email,
          subject: thread.subject || latest.subject || email.subject,
          snippet: rawSnippet || email.snippet,
          date: timestamp,
          isUnread: false,
        };
      });

      return {
        emails: updatedEmails,
        selectedThread: thread,
      };
    }),
}));
