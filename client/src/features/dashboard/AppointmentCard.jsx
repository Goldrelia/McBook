// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState } from "react";
import { Calendar, Clock, MapPin, Mail, Trash2 } from "lucide-react";
import Btn from "../../components/Btn";
import Avatar from "../../components/Avatar";
import { TYPE_CONFIG, STATUS_CONFIG } from "./appointmentConfig";

const ICON_SIZE = 13;

// -- AppointmentCard
// Props:
//   appt            — appointment object
//   delay           — animation delay in seconds
//   onDelete        — called when user clicks Cancel
//   confirmingDelete — boolean, true when delete confirm is showing
//   onConfirmDelete  — called when user confirms deletion
//   onCancelDelete   — called when user cancels deletion
export default function AppointmentCard({ appt, delay, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete }) {
  const [hovered, setHovered] = useState(false);
  const type = TYPE_CONFIG[appt.type] || TYPE_CONFIG.office_hours;
  const status = STATUS_CONFIG[appt.status] || STATUS_CONFIG.confirmed;

  return (
    <div
      className="mc-fade"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hovered ? "rgba(232,25,44,0.35)" : "var(--border)"}`,
        borderRadius: 10, padding: "16px 18px", marginBottom: 12,
        boxShadow: hovered ? "0 0 0 3px rgba(232,25,44,0.08), var(--shadow-sm)" : "var(--shadow-sm)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: type.bg, color: type.color }}>
              {type.label}
            </span>
            <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: status.bg, color: status.color }}>
              {status.label}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            {appt.title}
          </div>
        </div>
        <Avatar email={appt.owner_email} size={34} />
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 12 }}>
        {[
          { icon: <Calendar size={ICON_SIZE} />, val: appt.date },
          { icon: <Clock size={ICON_SIZE} />, val: appt.time },
          { icon: <MapPin size={ICON_SIZE} />, val: appt.location },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
            <span style={{ color: "var(--text3)" }}>{m.icon}</span>
            {m.val}
          </div>
        ))}
      </div>

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 12.5, color: "var(--text2)", fontWeight: 500 }}>
          {appt.owner_email?.split('@')[0].replace('.', ' ') || 'Owner'}
        </div>

        {appt.isRequestOnly ? (
          <div style={{ fontSize: 12.5, color: "var(--text3)", fontWeight: 500 }}>
            Awaiting owner response
          </div>
        ) : confirmingDelete ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Remove this booking?</span>
            <Btn variant="red" onClick={onConfirmDelete} style={{ padding: "4px 10px", fontSize: 12 }}>Yes</Btn>
            <Btn variant="outline" onClick={onCancelDelete} style={{ padding: "4px 10px", fontSize: 12 }}>No</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <a
              href={`mailto:${appt.owner_email}?subject=Re: ${encodeURIComponent(appt.title)}`}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text2)", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text3)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
            >
              <Mail size={ICON_SIZE} /> Email owner
            </a>
            <button
              onClick={onDelete}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text2)", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,25,44,0.4)"; e.currentTarget.style.color = "var(--red)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
            >
              <Trash2 size={ICON_SIZE} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}