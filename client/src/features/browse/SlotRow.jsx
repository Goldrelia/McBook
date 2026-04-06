// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState } from "react";
import { Calendar, Clock, MapPin, Repeat, Mail } from "lucide-react";

const ICON_SIZE = 13;

// -- SlotRow
// Props:
//   slot       — slot object
//   ownerEmail — owner's email for direct mailto
//   onReserve  — called when Reserve is clicked
export default function SlotRow({ slot, ownerEmail, onReserve }) {
  const [btnHov,  setBtnHov]  = useState(false);
  const [mailHov, setMailHov] = useState(false);
  const [rowHov,  setRowHov]  = useState(false);

  return (
    <div
      onMouseEnter={() => setRowHov(true)}
      onMouseLeave={() => setRowHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px",
        background: !slot.booked && rowHov ? "rgba(232,25,44,0.03)" : "var(--surface2)",
        border: "1px solid " + (!slot.booked && rowHov ? "rgba(232,25,44,0.18)" : "var(--border)"),
        borderRadius: 8,
        opacity: slot.booked ? 0.55 : 1,
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {/* Slot info */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
          <Calendar size={ICON_SIZE} /> {slot.day}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
          <Clock size={ICON_SIZE} /> {slot.time}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
          <MapPin size={ICON_SIZE} /> {slot.location}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text3)" }}>
          <Repeat size={ICON_SIZE} /> {slot.weeks}w
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {/* Direct email */}
        <a
          href={`mailto:${ownerEmail}?subject=Re: Office Hours — ${slot.day} ${slot.time}`}
          onMouseEnter={() => setMailHov(true)}
          onMouseLeave={() => setMailHov(false)}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "5px 10px", borderRadius: 6,
            border: "1px solid " + (mailHov ? "var(--text3)" : "var(--border)"),
            background: "transparent",
            color: mailHov ? "var(--text)" : "var(--text2)",
            fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            cursor: "pointer", textDecoration: "none", transition: "all 0.15s",
          }}
        >
          <Mail size={ICON_SIZE} />
        </a>

        {slot.booked ? (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text3)" }}>Reserved</span>
        ) : (
          <button
            onClick={onReserve}
            onMouseEnter={() => setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{
              padding: "5px 14px", borderRadius: 6,
              background: btnHov ? "var(--red)" : "transparent",
              color: btnHov ? "#fff" : "var(--red)",
              border: "1px solid " + (btnHov ? "var(--red)" : "rgba(232,25,44,0.35)"),
              fontSize: 12, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            Reserve
          </button>
        )}
      </div>
    </div>
  );
}