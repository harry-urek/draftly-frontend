import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
// Add Gmail API scopes as per blueprint Section 1.1
googleProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.modify");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
// Force account selection and consent screen
googleProvider.setCustomParameters({
  prompt: "consent",
  access_type: "offline",
});

export interface AuthUser extends User {}

export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Get Firebase ID Token for authentication (Blueprint Section 1.2)
    const idToken = await user.getIdToken();

    // Register user with backend (Blueprint Section 1.3)
    // Note: Since Firebase web SDK doesn't provide server auth codes,
    // we'll use the redirect-based OAuth flow for Gmail access
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // Empty body to satisfy content-type requirement
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to register with backend");
    }

    const data = await response.json();

    // Check if user needs to authorize Gmail access
    if (data.needsGmailAuth) {
      // Redirect to backend OAuth flow to get Gmail permissions
      window.location.href = `${API_BASE_URL}/auth/oauth/google/start?state=${user.uid}`;
      return null;
    }

    return user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const idToken = await auth.currentUser?.getIdToken();

    if (idToken) {
      await fetch(`${API_BASE_URL}/auth/session/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    }

    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user's ID token for API calls
export const getIdToken = async (): Promise<string | null> => {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
};
