// Authors: 
// Aurelia Bouliane - 261118164

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import useWindowWidth from "../hooks/useWindowWidth";

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
  const isMobile = useWindowWidth() < 768;
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("mcbook-token");
  const role = localStorage.getItem("mcbook-role");
  const email = localStorage.getItem("mcbook-email") || "";
  const loggedInLabel = (() => {
    const localPart = email.split("@")[0] || "";
    const first = localPart.split(".")[0] || localPart;
    if (!first) return role === "owner" ? "Owner" : "Student";
    return first.charAt(0).toUpperCase() + first.slice(1);
  })();

  function navigateHome() {
    if (token) {
      navigate(role === "owner" ? "/owner/dashboard" : "/dashboard");
      return;
    }
    navigate("/");
  }

  const navStyle = transparent
    ? {
      position: "sticky", top: 0, zIndex: 100,
      height: 64, display: "flex", alignItems: "center",
      padding: "0 28px", background: "transparent", gap: 12,
    }
    : {
      position: "sticky", top: 0, zIndex: 100,
      height: 64, display: "flex", alignItems: "center",
      padding: "0 28px",
      background: theme === "light" ? "rgba(238,240,244,0.92)" : "rgba(13,15,20,0.88)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--border)",
      gap: 12,
    };

  return (
    <>
      <nav style={navStyle}>
        {/* Logo + wordmark */}
        <button
          onClick={navigateHome}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
          aria-label="Home"
        >
          <img src={logo} alt="McBook logo" height={50} />
        </button>

        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          McBook
        </span>

        {/* Center nav links — desktop only */}
        {!isMobile && navLinks.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 20 }}>
            {navLinks.map((link, i) => (
              <NavLink key={i} onClick={link.onClick} active={link.active}>
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Right — theme toggle + buttons */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {token && !isMobile && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--text2)",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "5px 10px",
              }}
              title="You are logged in"
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
              Signed in as {loggedInLabel}
            </div>
          )}
          <button
            onClick={onToggle}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}
          </button>

          {/* Desktop action buttons */}
          {!isMobile && actions.map((action, i) => (
            <NavBtn key={i} onClick={action.onClick} variant={action.variant || "outline"}>
              {action.label}
            </NavBtn>
          ))}

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => setOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile sidebar */}
      {isMobile && open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          />
          {/* Panel */}
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 270, zIndex: 201,
            background: theme === "light" ? "#fff" : "var(--surface)",
            borderLeft: "1px solid var(--border)",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src={logo} alt="McBook logo" height={36} />
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>McBook</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", padding: 4 }} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            {navLinks.length > 0 && (
              <div style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                {navLinks.map((link, i) => (
                  <button key={i} onClick={() => { link.onClick(); setOpen(false); }}
                    style={{ width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: 8, border: "none", background: link.active ? "var(--red-light)" : "transparent", color: link.active ? "var(--red)" : "var(--text2)", fontWeight: link.active ? 700 : 500, fontSize: 15, fontFamily: "inherit", cursor: "pointer", display: "block", marginBottom: 2 }}>
                    {link.label}
                  </button>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {(token || actions.length > 0) && (
              <div style={{ padding: "12px" }}>
                {token && (
                  <div
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      borderRadius: 8,
                      background: "var(--surface2)",
                      color: "var(--text2)",
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    Signed in as {loggedInLabel}
                  </div>
                )}
                {actions.map((action, i) => (
                  <button key={i} onClick={() => { action.onClick(); setOpen(false); }}
                    style={{ width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: 8, border: "none", background: action.variant === "red" ? "var(--red)" : "transparent", color: action.variant === "red" ? "#fff" : "var(--text2)", fontWeight: 600, fontSize: 15, fontFamily: "inherit", cursor: "pointer", display: "block", marginBottom: 2 }}>
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
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