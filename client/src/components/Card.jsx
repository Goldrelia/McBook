// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

// ── Card ───────────────────────────────────────────────────────────
// Props:
//   children — content
//   style    — additional styles
export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: 18,
      boxShadow: "var(--shadow-sm)",
      ...style,
    }}>
      {children}
    </div>
  );
}
