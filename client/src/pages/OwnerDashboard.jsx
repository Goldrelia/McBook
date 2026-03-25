import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// -- Mock data 
const MOCK_SLOTS = [
  {
    id: 1,
    title: "Office Hours — COMP 307",
    type: "office_hours",
    status: "active",
    date: "Tuesday, April 1, 2026",
    time: "10:00 AM – 11:00 AM",
    location: "Trottier 3090",
    is_recurring: true,
    recurrence_weeks: 13,
    invite_token: "abc123xyz",
    bookings: [
      { id: 1, user: "Alice Martin", email: "alice.martin@mail.mcgill.ca" },
      { id: 2, user: "Bob Nguyen",   email: "bob.nguyen@mail.mcgill.ca" },
    ],
  },
  {
    id: 2,
    title: "TA Help Session",
    type: "office_hours",
    status: "private",
    date: "Friday, April 4, 2026",
    time: "1:00 PM – 2:00 PM",
    location: "Online (Zoom)",
    is_recurring: false,
    recurrence_weeks: null,
    invite_token: "def456uvw",
    bookings: [],
  },
];

const MOCK_REQUESTS = [
  {
    id: 1,
    user: "Carol Lee",
    email: "carol.lee@mail.mcgill.ca",
    message: "Hi Prof, I'd like to discuss my midterm feedback and talk about the project requirements.",
    status: "pending",
    created_at: "March 24, 2026",
  },
  {
    id: 2,
    user: "David Kim",
    email: "david.kim@mail.mcgill.ca",
    message: "I'm having trouble with Assignment 3 and would love 15 minutes to go over it.",
    status: "pending",
    created_at: "March 25, 2026",
  },
  {
    id: 3,
    user: "Emma Tremblay",
    email: "emma.tremblay@mail.mcgill.ca",
    message: "Could we meet to discuss potential research opportunities?",
    status: "accepted",
    created_at: "March 20, 2026",
  },
];

// -- CSS 
const css = `
  * { box-sizing: border-box; }
  @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap');
  :root { --red: #e8192c; --red-hover: #c9111f; --red-light: rgba(232,25,44,0.09); }
  [data-theme="light"] {
    --bg: #eef0f4; --surface: #fff; --surface2: #f8f9fb;
    --border: #dde0e7; --text: #0f1623; --text2: #4a5568; --text3: #9aa3b0;
    --shadow: 0 1px 3px rgba(0,0,0,0.07),0 4px 12px rgba(0,0,0,0.04);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  }
  [data-theme="dark"] {
    --bg: #0d0f14; --surface: #16181f; --surface2: #1e2028;
    --border: rgba(255,255,255,0.08); --text: #e8eaed; --text2: #8892a0; --text3: #50586a;
    --shadow: 0 1px 3px rgba(0,0,0,0.4),0 4px 12px rgba(0,0,0,0.25);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  }
  html,body,#root { height:100%; margin:0; padding:0; }
  body { background:var(--bg); color:var(--text); font-family:'Inter',system-ui,sans-serif; transition:background 0.2s,color 0.2s; }
  @keyframes mcFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .mc-fade { animation: mcFadeUp 0.35s ease both; }
  .mc-input {
    width:100%; padding:9px 12px;
    background:var(--surface2); border:1px solid var(--border); border-radius:7px;
    font-size:13.5px; font-family:inherit; color:var(--text); outline:none;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .mc-input:focus { border-color:var(--red); box-shadow:0 0 0 3px var(--red-light); }
  .mc-input::placeholder { color:var(--text3); }
  .mc-label { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:5px; display:block; letter-spacing:0.01em; }
`;

// -- Icons 
const Icon = ({ d, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const PlusIcon   = () => <Icon size={14} d="M12 5v14M5 12h14" />;
const MailIcon   = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />;
const TrashIcon  = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />;
const LinkIcon   = () => <Icon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />;
const CheckIcon  = () => <Icon d="M20 6L9 17l-5-5" />;
const XIcon      = () => <Icon d="M18 6L6 18M6 6l12 12" />;
const EyeIcon    = () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const EyeOffIcon = () => <Icon d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />;
const LogOutIcon = () => <Icon size={14} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;
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

// -- Helpers 
function initials(name) {
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}
const AVATAR_COLORS = ["#e8192c", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function generateTimeOptions() {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const period = h < 12 ? "am" : "pm";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const mm = String(m).padStart(2, "0");
      times.push(`${h12}:${mm}${period}`);
    }
  }
  return times;
}

// ── Shared UI ──────────────────────────────────────────────────────
function Btn({ children, variant = "red", onClick, style = {}, ...props }) {
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "6px 13px", borderRadius: 7, border: "none",
    fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
    cursor: "pointer", transition: "all 0.15s", ...style,
  };
  const variants = {
    red:     { background: hov ? "var(--red-hover)" : "var(--red)", color: "#fff", border: "none" },
    outline: { background: "transparent", color: hov ? "var(--text)" : "var(--text2)", border: "1px solid " + (hov ? "var(--text3)" : "var(--border)") },
    green:   { background: hov ? "#059669" : "#10b981", color: "#fff", border: "none" },
    danger:  { background: "transparent", color: hov ? "var(--red)" : "var(--text2)", border: "1px solid " + (hov ? "rgba(232,25,44,0.4)" : "var(--border)") },
  };
  return (
    <button {...props} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 18, boxShadow: "var(--shadow-sm)", ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
      {children}
    </div>
  );
}

function TimeDropdown({ value, onChange, placeholder = "Time" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);
  const times = generateTimeOptions();

  useEffect(() => {
    function handler(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && listRef.current && value) {
      const idx = times.indexOf(value);
      if (idx !== -1) {
        const item = listRef.current.children[idx];
        if (item) item.scrollIntoView({ block: "center" });
      }
    }
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "5px 12px",
          background: value ? "rgba(26,115,232,0.1)" : "var(--surface)",
          border: "1px solid " + (open ? "rgba(26,115,232,0.5)" : value ? "rgba(26,115,232,0.35)" : "var(--border)"),
          borderRadius: 6, fontSize: 13.5, fontFamily: "inherit",
          color: value ? "#1a73e8" : "var(--text3)",
          fontWeight: 500, cursor: "pointer", outline: "none",
          transition: "all 0.15s", whiteSpace: "nowrap",
          boxShadow: open ? "0 0 0 3px rgba(26,115,232,0.15)" : "none",
        }}
      >
        {value || placeholder}
      </button>

      {open && (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 9999,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            width: 150,
            maxHeight: 225,
            overflowY: "auto",
            padding: "4px 0",
          }}
        >
          {times.map(t => {
            const selected = t === value;
            return (
              <div
                key={t}
                onMouseDown={() => { onChange(t); setOpen(false); }}
                style={{
                  padding: "9px 16px",
                  fontSize: 13.5,
                  color: selected ? "#1a73e8" : "var(--text)",
                  background: selected ? "rgba(26,115,232,0.08)" : "transparent",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--surface2)"; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ width: 14, fontSize: 12, color: "#1a73e8" }}>
                  {selected ? "✓" : ""}
                </span>
                {t}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -- Tab config 
const TABS = [
  { key: "slots",    label: "My Slots" },
  { key: "requests", label: "Meeting Requests" },
];

// -- Main Component 
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme]           = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [tab, setTab]               = useState("slots");
  const [slots, setSlots]           = useState(MOCK_SLOTS);
  const [requests, setRequests]     = useState(MOCK_REQUESTS);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState(null);
  const [copiedToken, setCopiedToken]   = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (document.getElementById("mcbook-css")) return;
    const tag = document.createElement("style");
    tag.id = "mcbook-css";
    tag.textContent = css;
    document.head.appendChild(tag);
  }, []);

  function toggleStatus(id) {
    setSlots(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === "active" ? "private" : "active" } : s
    ));
  }

  function deleteSlot(id) {
    const slot = slots.find(s => s.id === id);
    slot.bookings.forEach(b => {
      window.open(`mailto:${b.email}?subject=Booking Cancelled: ${encodeURIComponent(slot.title)}&body=Hi ${b.user.split(" ")[0]},%0A%0AYour booking for "${slot.title}" has been cancelled.%0A%0AApologies for any inconvenience.`);
    });
    setSlots(prev => prev.filter(s => s.id !== id));
    setDeleteSlotId(null);
  }

  function copyInviteLink(token) {
    const url = `${window.location.origin}/book/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  function handleRequest(id, action) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    const req = requests.find(r => r.id === id);
    if (action === "accepted") {
      window.open(`mailto:${req.email}?subject=Meeting Request Accepted&body=Hi ${req.user.split(" ")[0]},%0A%0AYour meeting request has been accepted. I will follow up with a confirmed time shortly.%0A%0ABest regards`);
    }
  }

  function addSlot(slot) {
    setSlots(prev => [...prev, { ...slot, id: Date.now(), bookings: [], invite_token: Math.random().toString(36).slice(2, 10) }]);
    setShowCreate(false);
  }

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, height: 52,
        display: "flex", alignItems: "center", padding: "0 24px",
        background: theme === "light" ? "rgba(238,240,244,0.92)" : "rgba(13,15,20,0.88)",
        backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)", gap: 12,
      }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
          <svg width="26" height="26" viewBox="0 0 42 42" fill="none">
            <circle cx="17" cy="17" r="10" stroke="#e8192c" strokeWidth="3.2"/>
            <line x1="24.5" y1="24.5" x2="34" y2="34" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
            <line x1="31" y1="37" x2="36" y2="32" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
          </svg>
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>McBook</span>
        <span style={{ color: "var(--border)", fontSize: 18, margin: "0 2px" }}>|</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text2)" }}>Owner Dashboard</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <Btn variant="red" onClick={() => setShowCreate(true)}><PlusIcon /> New slot</Btn>
          <Btn variant="outline" onClick={() => { localStorage.removeItem("mcbook-token"); navigate("/login"); }}>
            <LogOutIcon /> Log out
          </Btn>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}>

        <div className="mc-fade" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 4 }}>
            Owner Dashboard
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
            {slots.length} slots &nbsp;·&nbsp; {slots.reduce((a, s) => a + s.bookings.length, 0)} total bookings &nbsp;·&nbsp; {pendingCount} pending requests
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 2,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 9, padding: 3, marginBottom: 20,
          width: "fit-content", boxShadow: "var(--shadow-sm)",
        }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "5px 14px", borderRadius: 6, border: "none",
              fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
              background: tab === t.key ? "var(--red)" : "transparent",
              color: tab === t.key ? "#fff" : "var(--text2)",
              transition: "all 0.15s",
            }}>
              {t.label}
              {t.key === "requests" && pendingCount > 0 && (
                <span style={{
                  marginLeft: 6,
                  background: tab === "requests" ? "rgba(255,255,255,0.25)" : "var(--red)",
                  color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 6px",
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── SLOTS TAB ── */}
        {tab === "slots" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>
            <div>
              {slots.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
                  No slots yet.{" "}
                  <button onClick={() => setShowCreate(true)} style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }}>
                    Create one →
                  </button>
                </Card>
              ) : (
                slots.map((slot, i) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    delay={i * 0.05}
                    onToggle={() => toggleStatus(slot.id)}
                    onDelete={() => setDeleteSlotId(slot.id)}
                    confirmingDelete={deleteSlotId === slot.id}
                    onConfirmDelete={() => deleteSlot(slot.id)}
                    onCancelDelete={() => setDeleteSlotId(null)}
                    onCopyLink={() => copyInviteLink(slot.invite_token)}
                    copied={copiedToken === slot.invite_token}
                  />
                ))
              )}
            </div>
            <div>
              <Card style={{ marginBottom: 14 }}>
                <SectionTitle>Summary</SectionTitle>
                {[
                  { label: "Total slots",    val: slots.length },
                  { label: "Active",         val: slots.filter(s => s.status === "active").length },
                  { label: "Private",        val: slots.filter(s => s.status === "private").length },
                  { label: "Total bookings", val: slots.reduce((a, s) => a + s.bookings.length, 0) },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--text2)" }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{row.val}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <SectionTitle>Quick actions</SectionTitle>
                <Btn variant="red" onClick={() => setShowCreate(true)} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
                  <PlusIcon /> New slot
                </Btn>
                <Btn variant="outline" onClick={() => setTab("requests")} style={{ width: "100%", justifyContent: "center" }}>
                  View requests {pendingCount > 0 && `(${pendingCount})`}
                </Btn>
              </Card>
            </div>
          </div>
        )}

        {/* ── REQUESTS TAB ── */}
        {tab === "requests" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>
            <div>
              {requests.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
                  No meeting requests yet.
                </Card>
              ) : (
                requests.map((req, i) => (
                  <RequestCard
                    key={req.id}
                    req={req}
                    delay={i * 0.05}
                    onAccept={() => handleRequest(req.id, "accepted")}
                    onDecline={() => handleRequest(req.id, "declined")}
                  />
                ))
              )}
            </div>
            <div>
              <Card>
                <SectionTitle>Requests summary</SectionTitle>
                {[
                  { label: "Pending",  val: requests.filter(r => r.status === "pending").length,  color: "#f59e0b" },
                  { label: "Accepted", val: requests.filter(r => r.status === "accepted").length, color: "#10b981" },
                  { label: "Declined", val: requests.filter(r => r.status === "declined").length, color: "var(--text3)" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--text2)" }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: row.color }}>{row.val}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE SLOT MODAL ── */}
      {showCreate && (
        <CreateSlotModal onClose={() => setShowCreate(false)} onSave={addSlot} />
      )}
    </div>
  );
}

// -- Slot Card
function SlotCard({ slot, delay, onToggle, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete, onCopyLink, copied }) {
  const [hov, setHov]           = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isActive = slot.status === "active";

  return (
    <div
      className="mc-fade"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hov ? "rgba(232,25,44,0.35)" : "var(--border)"}`,
        borderRadius: 10, padding: "16px 18px", marginBottom: 12,
        boxShadow: hov ? "0 0 0 3px rgba(232,25,44,0.08),var(--shadow-sm)" : "var(--shadow-sm)",
        transition: "border-color 0.15s,box-shadow 0.15s",
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{
              padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600,
              background: isActive ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.15)",
              color: isActive ? "#10b981" : "var(--text3)",
            }}>
              {isActive ? "Active" : "Private"}
            </span>
            {slot.is_recurring && (
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                Recurring · {slot.recurrence_weeks}w
              </span>
            )}
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            {slot.title}
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text2)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 10px", flexShrink: 0 }}>
          {slot.bookings.length} booked
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", marginBottom: 12, fontSize: 12.5, color: "var(--text2)" }}>
        <span>📅 {slot.date}</span>
        <span>🕐 {slot.time}</span>
        <span>📍 {slot.location}</span>
      </div>

      {slot.bookings.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--text3)", fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
          >
            {expanded ? "▾" : "▸"} {expanded ? "Hide" : "Show"} bookers ({slot.bookings.length})
          </button>
          {expanded && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {slot.bookings.map(b => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: avatarColor(b.user), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                      {initials(b.user)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{b.user}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text3)" }}>{b.email}</div>
                    </div>
                  </div>
                  <a
                    href={`mailto:${b.email}?subject=Re: ${encodeURIComponent(slot.title)}`}
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--text2)", textDecoration: "none", padding: "4px 9px", border: "1px solid var(--border)", borderRadius: 6, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <MailIcon /> Email
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn variant="outline" onClick={onToggle}>
            {isActive ? <EyeOffIcon /> : <EyeIcon />}
            {isActive ? "Make private" : "Activate"}
          </Btn>
          <Btn variant="outline" onClick={onCopyLink}>
            <LinkIcon /> {copied ? "Copied!" : "Copy invite link"}
          </Btn>
        </div>
        {confirmingDelete ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Delete this slot?</span>
            <Btn variant="red" onClick={onConfirmDelete} style={{ padding: "4px 10px" }}>Yes</Btn>
            <Btn variant="outline" onClick={onCancelDelete} style={{ padding: "4px 10px" }}>No</Btn>
          </div>
        ) : (
          <Btn variant="danger" onClick={onDelete}><TrashIcon /> Delete</Btn>
        )}
      </div>
    </div>
  );
}

// -- Request Card
function RequestCard({ req, delay, onAccept, onDecline }) {
  const [hov, setHov] = useState(false);
  const statusConfig = {
    pending:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    accepted: { label: "Accepted", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    declined: { label: "Declined", color: "var(--text3)", bg: "rgba(156,163,175,0.1)" },
  };
  const s = statusConfig[req.status];

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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColor(req.user), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initials(req.user)}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{req.user}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{req.email} · {req.created_at}</div>
          </div>
        </div>
        <span style={{ padding: "2px 9px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>
          {s.label}
        </span>
      </div>

      <div style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.6, padding: "10px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, marginBottom: 12 }}>
        "{req.message}"
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <a
          href={`mailto:${req.email}?subject=Re: Your Meeting Request`}
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: "var(--text2)", textDecoration: "none", padding: "5px 11px", border: "1px solid var(--border)", borderRadius: 6, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          <MailIcon /> Email
        </a>
        {req.status === "pending" && (
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="green" onClick={onAccept}><CheckIcon /> Accept</Btn>
            <Btn variant="danger" onClick={onDecline}><XIcon /> Decline</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// -- Create Slot Modal
function CreateSlotModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "", date: "", time_start: "", time_end: "", location: "",
    is_recurring: false, recurrence_weeks: "",
  });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSave() {
    if (!form.title || !form.date || !form.time_start || !form.time_end) return;
    onSave({
      title: form.title,
      type: "request",
      status: "private",
      date: new Date(form.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      time: `${form.time_start} – ${form.time_end}`,
      location: form.location || "TBD",
      is_recurring: form.is_recurring,
      recurrence_weeks: form.is_recurring ? parseInt(form.recurrence_weeks) || null : null,
    });
  }

  const isValid = form.title && form.date && form.time_start && form.time_end;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="mc-fade"
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 28, width: "100%", maxWidth: 420,
          boxSizing: "border-box",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Create new slot</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 2 }}>Type 1 — Meeting Request</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 4 }}>
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="mc-label">Slot title *</label>
            <input className="mc-input" placeholder="e.g. Office Hours — COMP 307" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          <div>
            <label className="mc-label">Date &amp; time *</label>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              padding: "8px 12px",
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 8,
              width: "100%",
            }}>
              <input
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                style={{
                  padding: "5px 10px",
                  background: form.date ? "rgba(26,115,232,0.1)" : "var(--surface)",
                  border: "1px solid " + (form.date ? "rgba(26,115,232,0.35)" : "var(--border)"),
                  borderRadius: 6, fontSize: 13.5, fontFamily: "inherit",
                  color: form.date ? "#1a73e8" : "var(--text3)",
                  fontWeight: 500, cursor: "pointer", outline: "none",
                  transition: "all 0.15s",
                }}
              />
              <TimeDropdown value={form.time_start} onChange={v => set("time_start", v)} placeholder="Start" />
              <span style={{ color: "var(--text3)", fontWeight: 500, fontSize: 13 }}>–</span>
              <TimeDropdown value={form.time_end} onChange={v => set("time_end", v)} placeholder="End" />
            </div>
          </div>

          <div>
            <label className="mc-label">Location</label>
            <input className="mc-input" placeholder="e.g. Trottier 3090 or Online (Zoom)" value={form.location} onChange={e => set("location", e.target.value)} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox" id="recurring" checked={form.is_recurring}
              onChange={e => set("is_recurring", e.target.checked)}
              style={{ cursor: "pointer", accentColor: "var(--red)", width: 15, height: 15 }}
            />
            <label htmlFor="recurring" style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", cursor: "pointer" }}>
              Recurring slot
            </label>
          </div>

          {form.is_recurring && (
            <div>
              <label className="mc-label">Number of weeks</label>
              <input className="mc-input" type="number" min="1" max="52" placeholder="e.g. 13" value={form.recurrence_weeks} onChange={e => set("recurrence_weeks", e.target.value)} />
            </div>
          )}

          <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6 }}>
            💡 This slot starts as <strong style={{ color: "var(--text2)" }}>private</strong>. Activate it from the dashboard to make it visible to students.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 22 }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="red" onClick={handleSave} style={{ opacity: isValid ? 1 : 0.5 }}>
            Create slot
          </Btn>
        </div>
      </div>
    </div>
  );
}
