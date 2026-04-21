// Authors:
// Aurelia Bouliane - 261118164

// -- PillBadge
// Props:
//   children — text content
export default function PillBadge({ children, className }) {
  return (
    <div className={className}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "5px 14px", borderRadius: 99,
        border: "1px solid var(--border)", background: "var(--surface)",
        fontSize: 12, fontWeight: 600, color: "var(--text3)",
        letterSpacing: "0.04em", textTransform: "uppercase",
        marginBottom: 20,
      }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", display: "inline-block" }} />
      {children}
    </div>
  );
}