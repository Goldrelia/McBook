// Authors:
// Aurelia Bouliane - 261118164
// Houman Azari - 261055604
import { useState } from "react";
import { Mail, Check, X } from "lucide-react";
import Btn from "../../components/Btn";
import Avatar from "../../components/Avatar";

const ICON_SIZE = 13;

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  accepted: { label: "Accepted", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  declined: { label: "Declined", color: "var(--text3)", bg: "rgba(156,163,175,0.1)" },
};

// -- RequestCard
// Props:
//   req       — request object
//   delay     — animation delay in seconds
//   onAccept  — accept the request
//   onDecline — decline the request
export default function RequestCard({ req, delay, onAccept, onDecline }) {
  const [hov, setHov] = useState(false);
  const s = STATUS_CONFIG[req.status];

  return (
    <div
      className="mc-fade"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hov ? "rgba(232,25,44,0.3)" : "var(--border)"}`,
        borderRadius: 10, padding: "16px 18px", marginBottom: 12,
        boxShadow: hov ? "0 0 0 3px rgba(232,25,44,0.07),var(--shadow-sm)" : "var(--shadow-sm)",
        transition: "border-color 0.15s,box-shadow 0.15s",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={req.user} size={36} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{req.user}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{req.email} · {req.created_at}</div>
          </div>
        </div>
        <span style={{ padding: "2px 9px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>
          {s.label}
        </span>
      </div>

      {/* Message */}
      <div style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.6, padding: "10px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, marginBottom: 12 }}>
        "{req.message}"
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <a
          href={`mailto:${req.email}?subject=Re: Your Meeting Request`}
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: "var(--text2)", textDecoration: "none", padding: "5px 11px", border: "1px solid var(--border)", borderRadius: 6, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          <Mail size={ICON_SIZE} /> Email
        </a>
        {req.status === "pending" && (
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="green"  onClick={onAccept}><Check size={ICON_SIZE} /> Accept</Btn>
            <Btn variant="danger" onClick={onDecline}><X size={ICON_SIZE} /> Decline</Btn>
          </div>
        )}
      </div>
    </div>
  );
}