// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { Calendar, Clock, MapPin, Repeat, Check } from "lucide-react";
import Avatar from "../../components/Avatar";

const ICON_SIZE = 13;

// -- ReserveModal
// Props:
//   owner     — owner object
//   slot      — slot being reserved
//   onConfirm — confirm the reservation
//   onClose   — close the modal
export default function ReserveModal({ owner, slot, onConfirm, onClose }) {
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
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>Confirm reservation</div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>You're about to reserve this office hours slot.</div>

        {/* Owner info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 9, marginBottom: 16 }}>
          <Avatar name={owner.name} size={38} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{owner.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{owner.role}</div>
          </div>
        </div>

        {/* Slot details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {[
            { icon: <Calendar size={ICON_SIZE} />, label: slot.day },
            { icon: <Clock size={ICON_SIZE} />,    label: slot.time },
            { icon: <MapPin size={ICON_SIZE} />,   label: slot.location },
            { icon: <Repeat size={ICON_SIZE} />,   label: `Repeats for ${slot.weeks} weeks` },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text2)" }}>
              <span style={{ color: "var(--text3)" }}>{row.icon}</span> {row.label}
            </div>
          ))}
        </div>

        <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6, marginBottom: 20 }}>
          💡 A notification email will be sent to <strong style={{ color: "var(--text2)" }}>{owner.name}</strong> and this booking will appear on your dashboard.
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text2)", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "var(--red)", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={ICON_SIZE} /> Confirm booking
          </button>
        </div>
      </div>
    </div>
  );
}