import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// -- Icons
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
  </svg>
);

const MCGILL_DOMAINS = ["@mcgill.ca", "@mail.mcgill.ca"];

function isMcgillEmail(email) {
  return MCGILL_DOMAINS.some(d => email.toLowerCase().endsWith(d));
}

// -- LoginPage
export default function LoginPage() {
  const navigate = useNavigate();
  const [theme, setTheme]     = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [emailValid, setEmailValid] = useState(null); // null | true | false

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  function handleEmailBlur() {
    if (!email) { setEmailValid(null); return; }
    setEmailValid(isMcgillEmail(email));
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    setError("");
    if (emailValid !== null) setEmailValid(isMcgillEmail(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isMcgillEmail(email)) {
      setEmailValid(false);
      setError("Please use your McGill email address (@mcgill.ca or @mail.mcgill.ca).");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      // TODO: replace with real API call
      // const res = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.error || "Login failed");
      // localStorage.setItem("mcbook-token", data.token);
      // localStorage.setItem("mcbook-role", data.role);
      // navigate(data.role === "owner" ? "/owner/dashboard" : "/dashboard");

      // -- Mock: simulate login
      await new Promise(r => setTimeout(r, 800));
      localStorage.setItem("mcbook-token", "mock-token-123");
      localStorage.setItem("mcbook-email", email);
      // Treat @mcgill.ca as professor/owner, @mail.mcgill.ca as student
      const role = email.endsWith("@mcgill.ca") ? "owner" : "student";
      localStorage.setItem("mcbook-role", role);
      navigate(role === "owner" ? "/owner/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const borderColor = (valid) => {
    if (valid === true)  return "#10b981";
    if (valid === false) return "var(--red)";
    return "var(--border)";
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="28" height="28" viewBox="0 0 42 42" fill="none">
            <circle cx="17" cy="17" r="10" stroke="#e8192c" strokeWidth="3.2"/>
            <line x1="24.5" y1="24.5" x2="34" y2="34" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
            <line x1="31" y1="37" x2="36" y2="32" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>McBook</span>
        </button>
        <button
          onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      {/* Center card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="mc-fade" style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "36px 32px", width: "100%", maxWidth: 400,
          boxSizing: "border-box", boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 6 }}>
              Welcome to McBook
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text3)", lineHeight: 1.5 }}>
              Sign in with your McGill email.<br/>First time? We'll set up your account automatically.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Email */}
            <div>
              <label className="mc-label">McGill email</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  placeholder="name@mail.mcgill.ca"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  autoComplete="email"
                  className="mc-input"
                  style={{ borderColor: borderColor(emailValid) }}
                />
                {emailValid === false && (
                  <div style={{ fontSize: 12, color: "var(--red)", marginTop: 5 }}>
                    Must be a McGill email (@mcgill.ca or @mail.mcgill.ca)
                  </div>
                )}
                {emailValid === true && (
                  <div style={{ fontSize: 12, color: "#10b981", marginTop: 5 }}>
                    ✓ Valid McGill email
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mc-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                  className="mc-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text3)", display: "flex", alignItems: "center", padding: 2,
                  }}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: 12.5, color: "var(--red)", padding: "8px 12px", background: "rgba(232,25,44,0.06)", border: "1px solid rgba(232,25,44,0.2)", borderRadius: 7 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "11px", borderRadius: 8, border: "none",
                background: loading ? "var(--border)" : "var(--red)",
                color: loading ? "var(--text3)" : "#fff",
                fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s", marginTop: 4,
              }}
            >
              {loading ? "Signing in…" : "Continue with McGill email"}
            </button>
          </form>

          {/* Footer note */}
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "var(--text3)", lineHeight: 1.6 }}>
            Professors &amp; TAs use <strong style={{ color: "var(--text2)" }}>@mcgill.ca</strong><br/>
            Students use <strong style={{ color: "var(--text2)" }}>@mail.mcgill.ca</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
