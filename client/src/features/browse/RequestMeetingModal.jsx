// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState } from "react";
import { X, Mail } from "lucide-react";
import TimeDropdown from "../../components/TimeDropdown";

const ICON_SIZE = 13;

// -- RequestMeetingModal
// Props:
//   owners           — list of all owners for the dropdown
//   preselectedOwner — owner to preselect in the dropdown (optional)
//   onClose          — close the modal
//   onSubmit         — function(form) called on submit
export default function RequestMeetingModal({ owners, preselectedOwner, onClose, onSubmit }) {
  const [form, setForm] = useState({
    ownerId:    String(preselectedOwner?.id || owners[0]?.id || ""),
    title:      "",
    date:       "",
    time_start: "",
    time_end:   "",
    message:    "",
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  const isValid = form.ownerId && form.title && form.date && form.time_start && form.time_end && form.message.trim();

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="mc-fade"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 460, boxSizing: "border-box", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Request a meeting</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 2 }}>Send a one-on-one meeting request to a professor or TA.</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", padding: 4 }}>
            <X size={ICON_SIZE} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="mc-label">Send to *</label>
            <select value={form.ownerId} onChange={e => set("ownerId", e.target.value)} className="mc-input" style={{ cursor: "pointer", appearance: "none" }}>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name} — {o.role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mc-label">Meeting title *</label>
            <input className="mc-input" placeholder="e.g. Assignment 3 Help" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          <div>
            <label className="mc-label">Preferred date &amp; time *</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <input
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                style={{ padding: "5px 10px", background: form.date ? "rgba(26,115,232,0.1)" : "var(--surface)", border: "1px solid " + (form.date ? "rgba(26,115,232,0.35)" : "var(--border)"), borderRadius: 6, fontSize: 13.5, fontFamily: "inherit", color: form.date ? "#1a73e8" : "var(--text3)", fontWeight: 500, cursor: "pointer", outline: "none" }}
              />
              <TimeDropdown value={form.time_start} onChange={v => set("time_start", v)} placeholder="Start" />
              <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
              <TimeDropdown value={form.time_end} onChange={v => set("time_end", v)} placeholder="End" />
            </div>
          </div>

          <div>
            <label className="mc-label">Message *</label>
            <textarea
              className="mc-input"
              placeholder="Briefly describe what you'd like to discuss…"
              rows={3}
              value={form.message}
              onChange={e => set("message", e.target.value)}
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </div>

          <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6 }}>
            💡 The professor or TA will receive your request and accept or decline. You'll be notified by email.
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text2)", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Cancel
            </button>
            <button
              onClick={() => { if (isValid) onSubmit(form); }}
              style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "var(--red)", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: isValid ? "pointer" : "not-allowed", opacity: isValid ? 1 : 0.5, display: "flex", alignItems: "center", gap: 6 }}
            >
              <Mail size={ICON_SIZE} /> Send request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}