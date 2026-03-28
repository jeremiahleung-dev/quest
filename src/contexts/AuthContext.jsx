import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const INACTIVITY_LIMIT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

function activityKey(uid) { return `quest-activity-${uid}`; }

function getLastActivity(uid) {
  const val = localStorage.getItem(activityKey(uid));
  return val ? new Date(val).getTime() : null;
}

function recordActivity(uid) {
  localStorage.setItem(activityKey(uid), new Date().toISOString());
}

function isInactive(uid) {
  const last = getLastActivity(uid);
  if (!last) return false; // No record means brand-new session, not inactive
  return Date.now() - last > INACTIVITY_LIMIT_MS;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]                           = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [pendingVerification, setPendingVerif]    = useState(false);
  const [pendingEmail, setPendingEmail]           = useState("");
  // Prevent double-processing auth state changes
  const processingRef = useRef(false);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPendingVerif(false);
    setPendingEmail("");
  }, []);

  // Record activity so the 30-day inactivity clock resets on meaningful use
  const touchActivity = useCallback(() => {
    if (user) recordActivity(user.id);
  }, [user]);

  useEffect(() => {
    // 1. Check for an existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (isInactive(session.user.id)) {
          // Silently sign out stale sessions
          supabase.auth.signOut().then(() => {
            setUser(null);
            setLoading(false);
          });
          return;
        }
        recordActivity(session.user.id);
        setUser(session.user);
      }
      setLoading(false);
    });

    // 2. Subscribe to future auth changes (OAuth redirects, token refreshes, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (processingRef.current) return;
      processingRef.current = true;

      if (event === "SIGNED_IN" && session?.user) {
        recordActivity(session.user.id);
        setUser(session.user);
        setPendingVerif(false);
        setPendingEmail("");
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Keep activity fresh on automatic token refresh
        recordActivity(session.user.id);
        setUser(session.user);
      }

      // Reset guard after a tick
      setTimeout(() => { processingRef.current = false; }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Auth actions ──────────────────────────────────────────────────────────

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect back to the app root after email confirmation
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;

    // When email confirmation is required, data.session is null
    if (data.user && !data.session) {
      setPendingVerif(true);
      setPendingEmail(email);
    }
    return data;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        // Request minimal scopes — only what we need
        scopes: "openid email profile",
      },
    });
    if (error) throw error;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      pendingVerification,
      pendingEmail,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      touchActivity,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
