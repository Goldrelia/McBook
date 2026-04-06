// Authors: 
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import logo from "../assets/logo.png";

// -- Navbar
// Props:
//   theme       — "light" | "dark"
//   onToggle    — function to toggle theme
//   navLinks    — array of { label, onClick, active? } shown as center nav links (optional)
//   actions     — array of { label, onClick, variant } shown on the right (optional)
//   transparent — boolean; when true renders a borderless, background-free nav
//                 intended for the landing page
export default function Navbar({ theme, onToggle, navLinks = [], actions = [], transparent = false }) {
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
      height: 64,
      display: "flex", alignItems: "center",
      padding: "0 28px",
      background: theme === "light" ? "rgba(238,240,244,0.92)" : "rgba(13,15,20,0.88)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--border)",
      gap: 12,
    };

  return (
    <nav style={navStyle}>
      {/* Logo + wordmark */}
      <button
        onClick={() => navigate("/")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
        aria-label="Home"
      >
        <img src={logo} alt="McBook logo" height={50} />
      </button>

      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
        McBook
      </span>

      {/* Center nav links */}
      {navLinks.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 20 }}>
          {navLinks.map((link, i) => (
            <NavLink key={i} onClick={link.onClick} active={link.active}>
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Right — theme toggle + action buttons */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onToggle}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text2)", display: "flex", alignItems: "center",
            padding: 4, borderRadius: 6,
          }}
          title="Toggle theme"
        >
          {theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}
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

// -- NavLink: center navigation items (Dashboard, About Us, etc.)
function NavLink({ children, onClick, active = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none",
        border: "none",
        borderBottom: active || hov ? "2px solid var(--red)" : "2px solid transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: active ? 700 : 500,
        fontSize: 15,
        color: active || hov ? "var(--text)" : "var(--text2)",
        padding: "4px 10px",
        borderRadius: active || hov ? "6px 6px 0 0" : 6,
        transition: "color 0.15s, border-color 0.15s",
        letterSpacing: active ? "-0.01em" : "normal",
      }}
    >
      {children}
    </button>
  );
}

function NavBtn({ children, variant, onClick }) {
  const [hov, setHov] = useState(false);

  const styles = {
    red: {
      background: "var(--red)", color: "#fff", border: "none",
      padding: "6px 13px", borderRadius: 7, fontSize: 15,
    },
    outline: {
      background: "transparent",
      color: hov ? "var(--text)" : "var(--text2)",
      border: "1px solid var(--border)",
      padding: "6px 13px", borderRadius: 7, fontSize: 15,
    },
    // Plain text button — used on the landing page for "Log in ->"
    ghost: {
      background: "none", border: "none",
      color: hov ? "var(--red)" : "var(--text)",
      padding: "6px 13px", fontSize: 15,
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