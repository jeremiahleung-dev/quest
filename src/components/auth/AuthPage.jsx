import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

// ─── Security helpers ─────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sanitizeEmail(raw) {
  return raw.trim().toLowerCase();
}

function validatePassword(pw) {
  if (pw.length < 8)           return "At least 8 characters required.";
  if (!/[A-Z]/.test(pw))       return "Must include at least one uppercase letter.";
  if (!/[0-9]/.test(pw))       return "Must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Must include at least one special character.";
  return null;
}

// Map Supabase error messages to user-safe text without leaking internals
function friendlyError(msg) {
  if (!msg) return "Something went wrong. Please try again.";
  if (msg.includes("Invalid login credentials"))  return "Incorrect email or password.";
  if (msg.includes("Email not confirmed"))         return "Please confirm your email first. Check your inbox.";
  if (msg.includes("User already registered"))     return "An account with this email already exists. Sign in instead.";
  if (msg.includes("Password should be"))          return "Password does not meet the requirements.";
  if (msg.includes("over_email_send_rate_limit"))  return "Too many attempts. Please wait a few minutes.";
  if (msg.includes("rate limit"))                  return "Too many requests. Please slow down.";
  // Fallback — do not expose raw Supabase internals
  return "Authentication failed. Please try again.";
}

// ─── Email verification pending screen ───────────────────────────────────────

function VerifyEmail({ email, dark }) {
  const fg     = dark ? "#e5e7eb" : "#111827";
  const fgMu   = dark ? "#6b7280" : "#9ca3af";
  const bg     = dark ? "#0a0a0a" : "#f9fafb";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem" }}>📧</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: fg, marginBottom: "0.75rem" }}>
          Confirm your email
        </h1>
        <p style={{ fontSize: "0.9rem", color: fgMu, lineHeight: 1.65, marginBottom: "0.5rem" }}>
          We sent a confirmation link to
        </p>
        <p style={{ fontSize: "0.95rem", fontWeight: 600, color: fg, marginBottom: "1rem", wordBreak: "break-all" }}>
          {email}
        </p>
        <p style={{ fontSize: "0.85rem", color: fgMu, lineHeight: 1.65 }}>
          Click the link in that email to activate your account and begin your quest.
          Check your spam folder if you don&apos;t see it within a few minutes.
        </p>
      </div>
    </div>
  );
}

// ─── Main auth page ───────────────────────────────────────────────────────────

export default function AuthPage({ dark }) {
  const { signIn, signUp, signInWithGoogle, pendingVerification, pendingEmail } = useAuth();

  const [mode, setMode]                   = useState("login");   // "login" | "signup"
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPw, setConfirmPw]         = useState("");
  const [error, setError]                 = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Theme tokens
  const bg      = dark ? "#0a0a0a" : "#f9fafb";
  const fg      = dark ? "#e5e7eb" : "#111827";
  const fgMuted = dark ? "#6b7280" : "#9ca3af";
  const cardBg  = dark ? "#161616" : "#ffffff";
  const border  = dark ? "#262626" : "#e5e7eb";
  const accent  = "#7c3aed";
  const accentL = "#a78bfa";

  if (pendingVerification) {
    return <VerifyEmail email={pendingEmail} dark={dark} />;
  }

  const switchMode = () => {
    setMode(m => m === "login" ? "signup" : "login");
    setError(null);
    setPassword("");
    setConfirmPw("");
  };

  const inputStyle = {
    width: "100%",
    padding: "0.875rem 1rem",
    background: dark ? "#111111" : "#fafafa",
    border: `1px solid ${border}`,
    borderRadius: "10px",
    fontSize: "0.93rem",
    color: fg,
    fontFamily: "inherit",
    marginBottom: "0.8rem",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = sanitizeEmail(email);

    if (!EMAIL_RE.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      const pwErr = validatePassword(password);
      if (pwErr) { setError(pwErr); return; }
      if (password !== confirmPw) { setError("Passwords do not match."); return; }
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(cleanEmail, password);
      } else {
        await signIn(cleanEmail, password);
      }
    } catch (err) {
      setError(friendlyError(err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Page will redirect — no further state update needed
    } catch (err) {
      setError(friendlyError(err?.message));
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 400, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>⚔️</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: fg, marginBottom: "0.3rem", letterSpacing: "-0.02em" }}>quest</h1>
          <p style={{ fontSize: "0.82rem", color: fgMuted }}>
            {mode === "login" ? "Welcome back, hero." : "Create your account to begin."}
          </p>
        </div>

        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "1.75rem", boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", padding: "0.8rem", background: dark ? "#1c1c1c" : "#ffffff", border: `1px solid ${border}`, borderRadius: "10px", cursor: googleLoading ? "default" : "pointer", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: 500, color: googleLoading ? fgMuted : fg, marginBottom: "1.25rem", transition: "background 0.15s, border-color 0.15s", opacity: googleLoading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = dark ? "#252525" : "#f3f4f6"; }}
            onMouseLeave={e => { e.currentTarget.style.background = dark ? "#1c1c1c" : "#ffffff"; }}
          >
            {/* Google "G" logo SVG */}
            <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: 1, background: border }} />
            <span style={{ fontSize: "0.7rem", color: fgMuted, userSelect: "none" }}>or</span>
            <div style={{ flex: 1, height: 1, background: border }} />
          </div>

          {/* Error banner */}
          {error && (
            <div role="alert" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "0.6rem 0.875rem", fontSize: "0.82rem", color: "#f87171", marginBottom: "1rem", lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          {/* Email / password form */}
          <form onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = accentL)}
              onBlur={e  => (e.target.style.borderColor = border)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = accentL)}
              onBlur={e  => (e.target.style.borderColor = border)}
            />
            {mode === "signup" && (
              <>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = accentL)}
                  onBlur={e  => (e.target.style.borderColor = border)}
                />
                <p style={{ fontSize: "0.7rem", color: fgMuted, margin: "-0.35rem 0 0.875rem 0.2rem", lineHeight: 1.55 }}>
                  8+ chars · uppercase · number · special character
                </p>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ width: "100%", background: submitting ? "transparent" : accent, border: `1px solid ${submitting ? border : accent}`, borderRadius: "10px", padding: "0.875rem", cursor: submitting ? "default" : "pointer", color: submitting ? fgMuted : "#fff", fontSize: "0.93rem", fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s", marginTop: "0.15rem" }}
            >
              {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Toggle login/signup */}
          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.82rem", color: fgMuted }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={switchMode}
              style={{ background: "none", border: "none", color: accentL, cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, padding: 0 }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Privacy note for signup */}
        {mode === "signup" && (
          <p style={{ textAlign: "center", fontSize: "0.68rem", color: fgMuted, marginTop: "1.25rem", lineHeight: 1.6, padding: "0 1rem" }}>
            Your email is used only for account verification and critical security notices.
          </p>
        )}
      </div>
    </div>
  );
}
