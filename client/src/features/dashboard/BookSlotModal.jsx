// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
import { X } from "lucide-react";

// -- BookSlotModal
// Props:
//   onClose   — close the modal
//   onRequest — navigate to meeting request flow
//   onBrowse  — navigate to browse slots page
export default function BookSlotModal({ onClose, onRequest, onBrowse }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="mc-fade"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 400, boxSizing: "border-box", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Book a slot</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 4 }}>
            <X size={13} />
          </button>
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 22 }}>How would you like to book?</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={onRequest}
            style={{ width: "100%", padding: "16px 18px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,25,44,0.3)"; e.currentTarget.style.background = "rgba(232,25,44,0.03)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface2)"; }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>✉️ Request a meeting</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)", lineHeight: 1.5 }}>
              Send a message to a professor or TA requesting a one-on-one. They'll accept or decline.
            </div>
          </button>

          <button
            onClick={onBrowse}
            style={{ width: "100%", padding: "16px 18px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,25,44,0.3)"; e.currentTarget.style.background = "rgba(232,25,44,0.03)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface2)"; }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>🗓️ Browse office hours</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)", lineHeight: 1.5 }}>
              Search for a professor or TA and reserve an available recurring office hours slot directly.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}