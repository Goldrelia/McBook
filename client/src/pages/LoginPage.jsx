import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Eye, EyeOff} from "lucide-react";

const DEFAULT_ICON_SIZE = 16;
const MCGILL_DOMAINS = ["@mcgill.ca", "@mail.mcgill.ca"];

function isMcgillEmail(email) {
  return MCGILL_DOMAINS.some(d => email.toLowerCase().endsWith(d));
}

// -- LoginPage
export default function LoginPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    if (valid === true) return "#10b981";
    if (valid === false) return "var(--red)";
    return "var(--border)";
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      <Navbar
        transparent
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
      />

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
              Sign in with your McGill email.<br />First time? We'll set up your account automatically.
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
                  {showPw ? <EyeOff size={DEFAULT_ICON_SIZE}/> : <Eye size={DEFAULT_ICON_SIZE}/>}
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
            Professors &amp; TAs use <strong style={{ color: "var(--text2)" }}>@mcgill.ca</strong><br />
            Students use <strong style={{ color: "var(--text2)" }}>@mail.mcgill.ca</strong>
          </div>
        </div>
      </div>
    </div>
  );
}