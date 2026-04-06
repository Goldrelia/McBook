// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState } from "react";
import { Send } from "lucide-react";
import Avatar from "../../components/Avatar";
import SlotRow from "./SlotRow";

const ICON_SIZE = 13;

// -- OwnerCard
// Props:
//   owner     — owner object (name, email, role, department, slots)
//   delay     — animation delay in seconds
//   onReserve — function(slot) called when a slot is reserved
//   onRequest — called when Request button is clicked
export default function OwnerCard({ owner, delay, onReserve, onRequest }) {
  const available = owner.slots.filter(s => !s.booked);
  const [reqHov, setReqHov] = useState(false);

  return (
    <div
      className="mc-fade"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10, padding: "18px 20px", marginBottom: 14,
        boxShadow: "var(--shadow-sm)",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Owner header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Avatar name={owner.name} size={40} />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{owner.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{owner.role} · {owner.department}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 5,
            background: available.length > 0 ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.1)",
            color: available.length > 0 ? "#10b981" : "var(--text3)",
          }}>
            {available.length} slot{available.length !== 1 ? "s" : ""} available
          </div>
          <button
            onClick={onRequest}
            onMouseEnter={() => setReqHov(true)}
            onMouseLeave={() => setReqHov(false)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 5,
              fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
              background: reqHov ? "rgba(232,25,44,0.08)" : "transparent",
              color: reqHov ? "var(--red)" : "var(--text3)",
              border: "1px solid " + (reqHov ? "rgba(232,25,44,0.3)" : "var(--border)"),
              transition: "all 0.15s",
            }}
          >
            <Send size={ICON_SIZE} /> Request
          </button>
        </div>
      </div>

      {/* Slot rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {owner.slots.map(slot => (
          <SlotRow
            key={slot.id}
            slot={slot}
            ownerEmail={owner.email}
            onReserve={() => onReserve(slot)}
          />
        ))}
      </div>
    </div>
  );
}