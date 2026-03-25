// Authors: 
// Aurelia Bouliane - 261118164
// Houman Azari - 261055604
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

// Logo size scales up slightly in transparent (landing) mode
const LogoIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 42 42" fill="none">
    <circle cx="17" cy="17" r="10" stroke="#e8192c" strokeWidth="3.2"/>
    <line x1="24.5" y1="24.5" x2="34" y2="34" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
    <line x1="31" y1="37" x2="36" y2="32" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
  </svg>
);

// -- Navbar
// Props:
//   theme       — "light" | "dark"
//   onToggle    — function to toggle theme
//   title       — page title shown after the divider (optional)
//   actions     — array of { label, onClick, variant } (optional)
//   transparent — boolean; when true renders a borderless, background-free nav
//                 intended for the landing page
export default function Navbar({ theme, onToggle, title, actions = [], transparent = false }) {
  const navigate = useNavigate();

  const navStyle = transparent
    ? {
        position: "sticky", top: 0, zIndex: 100,
        height: 64,
        display: "flex", alignItems: "center",
        padding: "0 28px",
        background: "transparent",
        gap: 12,
      }
    : {
        position: "sticky", top: 0, zIndex: 100,
        height: 52,
        display: "flex", alignItems: "center",
        padding: "0 24px",
        background: theme === "light" ? "rgba(238,240,244,0.92)" : "rgba(13,15,20,0.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        gap: 12,
      };

  return (
    <nav style={navStyle}>
      <button
        onClick={() => navigate("/")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
        aria-label="Home"
      >
        <LogoIcon size={transparent ? 34 : 26} />
      </button>

      <span style={{
        fontSize: transparent ? 16 : 14,
        fontWeight: 700,
        color: "var(--text)",
        letterSpacing: "-0.02em",
      }}>
        McBook
      </span>

      {title && !transparent && (
        <>
          <span style={{ color: "var(--border)", fontSize: 18, margin: "0 2px" }}>|</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text2)" }}>{title}</span>
        </>
      )}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: transparent ? 16 : 8 }}>
        <button
          onClick={onToggle}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text2)", display: "flex", alignItems: "center",
            padding: 4, borderRadius: 6,
          }}
          title="Toggle theme"
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        {actions.map((action, i) => (
          <NavBtn key={i} onClick={action.onClick} variant={action.variant || "outline"}>
            {action.label}
          </NavBtn>
        ))}
      </div>
    </nav>
  );
}

function NavBtn({ children, variant, onClick }) {
  const [hov, setHov] = useState(false);

  const styles = {
    red: {
      background: "var(--red)", color: "#fff", border: "none",
      padding: "6px 13px", borderRadius: 7, fontSize: 12.5,
    },
    outline: {
      background: "transparent",
      color: hov ? "var(--text)" : "var(--text2)",
      border: "1px solid var(--border)",
      padding: "6px 13px", borderRadius: 7, fontSize: 12.5,
    },
    // Plain text button — used on the landing page for "Log in →"
    ghost: {
      background: "none", border: "none",
      color: hov ? "var(--red)" : "var(--text)",
      padding: "4px 0", fontSize: 15,
    },
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontWeight: 600, fontFamily: "inherit",
        cursor: "pointer", transition: "color 0.15s, background 0.15s",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}