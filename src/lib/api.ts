const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = {
  // Auth endpoints
  login: () => `${API_BASE_URL}/auth/login`,
  logout: () => `${API_BASE_URL}/auth/logout`,
  session: () => `${API_BASE_URL}/auth/session`,

  // Email endpoints
  emails: () => `${API_BASE_URL}/mail/messages`,
  refreshEmails: () => `${API_BASE_URL}/mail/refresh`,
  syncEmails: () => `${API_BASE_URL}/mail/sync`,
  threads: (threadId: string) => `${API_BASE_URL}/threads/${threadId}`,

  // Send email
  sendEmail: () => `${API_BASE_URL}/emails/send`,

  // Onboarding endpoints
  onboarding: {
    start: () => `${API_BASE_URL}/onboarding/start`,
    status: () => `${API_BASE_URL}/onboarding/status`,
    submit: () => `${API_BASE_URL}/onboarding/submit`,
    profile: () => `${API_BASE_URL}/onboarding/profile`,
  },

  // Generic request methods
  get: async (url: string) => {
    const idToken = await getIdToken();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  post: async (url: string, data?: unknown) => {
    const idToken = await getIdToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Helper function to trigger email sync
export async function syncEmails() {
  const idToken = await getIdToken();
  if (!idToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(api.syncEmails(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to sync emails');
  }

  return response.json();
}

// Helper function to get current user's ID token
async function getIdToken(): Promise<string | null> {
  const { auth } = await import('./firebase');
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
}