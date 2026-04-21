// Authors:
// Aurelia Bouliane - 261118164

import { useState } from "react";

// -- FeatureCard
// Props:
//   icon  — JSX element (lucide icon)
//   title — string
//   desc  — string
//   delay — animation delay in seconds (optional)
export default function FeatureCard({ icon, title, desc, delay = 0 }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      className="mc-fade"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        animationDelay: `${delay}s`,
        background: "var(--surface)",
        border: `1px solid ${hov ? "rgba(232,25,44,0.3)" : "var(--border)"}`,
        borderRadius: 12, padding: "24px 22px",
        boxShadow: hov ? "0 0 0 3px rgba(232,25,44,0.07), var(--shadow-sm)" : "var(--shadow-sm)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        textAlign: "left",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 9,
        background: "var(--red-light)", color: "var(--red)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.01em" }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
        {desc}
      </div>
    </div>
  );
}