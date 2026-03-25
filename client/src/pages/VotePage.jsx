import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// -- Mock data (replace with GET /api/slots/vote/:token)
const MOCK_GROUP_SLOTS = {
  "grp789abc": {
    title: "Project Demo Scheduling",
    owner: "Joseph P Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    location: "TBD",
    slots: [
      { id: 1, date: "Monday, April 7", time: "2:00pm – 3:00pm", votes: 3 },
      { id: 2, date: "Monday, April 7", time: "5:00pm – 6:00pm", votes: 1 },
      { id: 3, date: "Tuesday, April 8", time: "9:00am – 10:00am", votes: 5 },
    ],
  },
};

// -- Icons
const Icon = ({ d, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const CheckIcon  = () => <Icon d="M20 6L9 17l-5-5" />;
const CalIcon    = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PinIcon    = () => <Icon size={14} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const PersonIcon = () => <Icon size={14} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />;
const MoonIcon   = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

// -- VotePage
export default function VotePage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [theme, setTheme]       = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [selected, setSelected] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");

  const data = MOCK_GROUP_SLOTS[token];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  function toggleSlot(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSubmit() {
    if (!name.trim() || !email.trim() || selected.size === 0) return;
    setSubmitted(true);
    // TODO: POST /api/slots/vote/:token { name, email, slot_ids: [...selected] }
  }

  const isValid = name.trim() && email.trim() && selected.size > 0;

  // -- Not found
  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Invite link not found</div>
        <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 24 }}>This link may have expired or been removed.</div>
        <button onClick={() => navigate("/")} style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Go home
        </button>
      </div>
    </div>
  );

  // -- Submitted confirmation
  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40, maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#10b981" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.02em" }}>Availability submitted!</div>
        <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 6, lineHeight: 1.6 }}>
          Thanks {name.split(" ")[0]}! Your availability has been recorded for <strong style={{ color: "var(--text2)" }}>{data.title}</strong>.
        </div>
        <div style={{ fontSize: 13.5, color: "var(--text3)", marginBottom: 24 }}>
          You selected <strong style={{ color: "var(--text2)" }}>{selected.size}</strong> slot{selected.size !== 1 ? "s" : ""}. {data.owner} will finalize the time and you'll be notified.
        </div>
        <button onClick={() => navigate("/")} style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Back to McBook
        </button>
      </div>
    </div>
  );

  // -- Main vote page
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Minimal navbar */}
      <nav style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
        background: theme === "light" ? "rgba(238,240,244,0.92)" : "rgba(13,15,20,0.88)",
        backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)",
      }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 42 42" fill="none">
            <circle cx="17" cy="17" r="10" stroke="#e8192c" strokeWidth="3.2"/>
            <line x1="24.5" y1="24.5" x2="34" y2="34" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
            <line x1="31" y1="37" x2="36" y2="32" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>McBook</span>
        </button>
        <button
          onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", padding: 4 }}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div className="mc-fade" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--red)", marginBottom: 8 }}>
            Group Meeting — Availability Poll
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 10 }}>
            {data.title}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 13, color: "var(--text2)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><PersonIcon /> {data.owner}</span>
            {data.location !== "TBD" && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><PinIcon /> {data.location}</span>}
          </div>
        </div>

        {/* Your info */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18, boxShadow: "var(--shadow-sm)", marginBottom: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14, letterSpacing: "-0.01em" }}>Your information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="mc-label">Full name *</label>
              <input className="mc-input" placeholder="e.g. Alice Martin" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="mc-label">McGill email *</label>
              <input className="mc-input" type="email" placeholder="name@mail.mcgill.ca" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Slot selection */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18, boxShadow: "var(--shadow-sm)", marginBottom: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.01em" }}>Select all times that work for you</div>
          <div style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 14 }}>You can select multiple slots</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.slots.map(slot => {
              const isSelected = selected.has(slot.id);
              return (
                <div
                  key={slot.id}
                  onClick={() => toggleSlot(slot.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 14px",
                    background: isSelected ? "rgba(232,25,44,0.05)" : "var(--surface2)",
                    border: `1px solid ${isSelected ? "rgba(232,25,44,0.35)" : "var(--border)"}`,
                    borderRadius: 8, cursor: "pointer",
                    boxShadow: isSelected ? "0 0 0 3px rgba(232,25,44,0.08)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${isSelected ? "var(--red)" : "var(--border)"}`,
                    background: isSelected ? "var(--red)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {isSelected && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{slot.date}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{slot.time}</div>
                  </div>

                  {/* Vote bar (subtle) */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <div style={{ width: 48, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: isSelected ? "var(--red)" : "#3b82f6", borderRadius: 2, width: `${Math.min(100, (slot.votes / 6) * 100)}%`, transition: "background 0.15s" }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--text3)", minWidth: 20 }}>{slot.votes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected summary */}
        {selected.size > 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(232,25,44,0.05)", border: "1px solid rgba(232,25,44,0.2)", borderRadius: 8, fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
            ✅ <strong style={{ color: "var(--text)" }}>{selected.size}</strong> slot{selected.size !== 1 ? "s" : ""} selected
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          style={{
            width: "100%", padding: "12px", borderRadius: 8,
            background: isValid ? "var(--red)" : "var(--border)",
            color: isValid ? "#fff" : "var(--text3)",
            border: "none", cursor: isValid ? "pointer" : "not-allowed",
            fontSize: 14.5, fontWeight: 700, fontFamily: "inherit",
            transition: "all 0.15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <CheckIcon /> Submit my availability
        </button>
      </div>
    </div>
  );
}
