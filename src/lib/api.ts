const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = {
  // Auth endpoints
  login: () => `${API_BASE_URL}/auth/login`,
  logout: () => `${API_BASE_URL}/auth/logout`,
  // session endpoint replaced by status in new API
  session: () => `${API_BASE_URL}/auth/status`,

  // Email endpoints (new API under /api/emails)
  emails: () => `${API_BASE_URL}/api/emails`,
  refreshEmails: () => `${API_BASE_URL}/api/emails/refresh`,
  syncEmails: () => `${API_BASE_URL}/api/emails/sync`,
  message: (id: string) => `${API_BASE_URL}/api/emails/${id}`,

  // Send/draft email
  sendEmail: () => `${API_BASE_URL}/api/emails/send`,
  draftEmail: () => `${API_BASE_URL}/api/emails/draft`,

  // Onboarding endpoints (new API under /api/onboarding)
  onboarding: {
    start: () => `${API_BASE_URL}/api/onboarding/start`,
    status: () => `${API_BASE_URL}/api/onboarding/status`,
    submit: () => `${API_BASE_URL}/api/onboarding/generate-profile`,
  },

  // Generic request methods
  get: async (url: string) => {
    const idToken = await getIdToken();
    if (!idToken) {
      throw new Error("Not authenticated. Please log in.");
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    return response.json();
  },

  post: async (url: string, data?: unknown) => {
    const idToken = await getIdToken();
    if (!idToken) {
      throw new Error("Not authenticated. Please log in.");
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${idToken}`,
    };

    // Only set Content-Type if we have data
    if (data) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
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
    throw new Error("Not authenticated");
  }

  const response = await fetch(api.syncEmails(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to sync emails");
  }

  return response.json();
}

// Helper function to get current user's ID token
async function getIdToken(): Promise<string | null> {
  const { auth } = await import("./firebase");
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
}
