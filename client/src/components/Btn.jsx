import { useState } from "react";

// -- Btn
// Props:
//   variant — "red" | "outline" | "green" | "danger"
//   onClick — function
//   style   — additional styles
export default function Btn({ children, variant = "red", onClick, style = {}, ...props }) {
  const [hov, setHov] = useState(false);

  const base = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "6px 13px", borderRadius: 7, border: "none",
    fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
    cursor: "pointer", transition: "all 0.15s", ...style,
  };

  const variants = {
    red: { background: hov ? "var(--red-hover)" : "var(--red)", color: "#fff", border: "none" },
    outline: { background: "transparent", color: hov ? "var(--text)" : "var(--text2)", border: "1px solid " + (hov ? "var(--text3)" : "var(--border)") },
    green: { background: hov ? "#059669" : "#10b981", color: "#fff", border: "none" },
    danger: { background: "transparent", color: hov ? "var(--red)" : "var(--text2)", border: "1px solid " + (hov ? "rgba(232,25,44,0.4)" : "var(--border)") },
  };

  return (
    <button
      {...props}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
}
