import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Mock data (replace with real API calls) ────────────────────────
const MOCK_APPOINTMENTS = [
  {
    id: 1,
    title: "Office Hours — Prof. Vybihal",
    type: "office_hours",
    date: "Tuesday, April 1, 2026",
    time: "10:00 AM – 11:00 AM",
    location: "Trottier 3090",
    owner: "Joseph P Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "confirmed",
  },
  {
    id: 2,
    title: "TA Office Hours — Assignment 3",
    type: "office_hours",
    date: "Friday, April 4, 2026",
    time: "1:00 PM – 2:00 PM",
    location: "Online (Zoom)",
    owner: "Derek Long",
    ownerEmail: "derek.long@mail.mcgill.ca",
    status: "confirmed",
  },
  {
    id: 3,
    title: "Project Demo Coordination",
    type: "group",
    date: "Wednesday, April 9, 2026",
    time: "3:00 PM – 4:00 PM",
    location: "McConnell 103",
    owner: "Joseph P Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "confirmed",
  },
  {
    id: 4,
    title: "One-on-One Meeting Request",
    type: "request",
    date: "Pending approval",
    time: "TBD",
    location: "TBD",
    owner: "Joseph P Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "pending",
  },
];

// ── CSS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap');

  :root { --red: #e8192c; --red-hover: #c9111f; --red-light: rgba(232,25,44,0.09); }

  [data-theme="light"] {
    --bg: #eef0f4; --surface: #fff; --surface2: #f8f9fb;
    --border: #dde0e7; --text: #0f1623; --text2: #4a5568; --text3: #9aa3b0;
    --shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  }
  [data-theme="dark"] {
    --bg: #0d0f14; --surface: #16181f; --surface2: #1e2028;
    --border: rgba(255,255,255,0.08); --text: #e8eaed; --text2: #8892a0; --text3: #50586a;
    --shadow: 0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  }

  html, body, #root { height: 100%; margin: 0; padding: 0; }

  body {
    background: var(--bg); color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    transition: background 0.2s, color 0.2s;
  }

  @keyframes mcFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mc-fade { animation: mcFadeUp 0.35s ease both; }
`;

// ── Icons ──────────────────────────────────────────────────────────
const MoonIcon = () => (
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

const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ── Type badge config ──────────────────────────────────────────────
const TYPE_CONFIG = {
  office_hours: { label: "Office Hours", color: "var(--red)",  bg: "rgba(232,25,44,0.09)" },
  group:        { label: "Group Meeting", color: "#3b82f6",    bg: "rgba(59,130,246,0.09)" },
  request:      { label: "Meeting Request", color: "#10b981",  bg: "rgba(16,185,129,0.09)" },
};

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "#10b981", bg: "rgba(16,185,129,0.09)" },
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.09)" },
};

// ── Avatar helper ──────────────────────────────────────────────────
function initials(name) {
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = ["#e8192c", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Main Component ─────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id of appt pending delete
  const [filter, setFilter] = useState("all");

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  // Inject CSS once
  useEffect(() => {
    if (document.getElementById("mcbook-css")) return;
    const tag = document.createElement("style");
    tag.id = "mcbook-css";
    tag.textContent = css;
    document.head.appendChild(tag);
  }, []);

  function handleDelete(id) {
    setAppointments(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    // TODO: call DELETE /api/bookings/:id
  }

  function handleLogout() {
    localStorage.removeItem("mcbook-token");
    navigate("/login");
    // TODO: call POST /api/auth/logout
  }

  const filtered = filter === "all"
    ? appointments
    : appointments.filter(a => a.type === filter);

  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const pending   = appointments.filter(a => a.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 52,
        display: "flex", alignItems: "center",
        padding: "0 24px",
        background: theme === "light" ? "rgba(238,240,244,0.92)" : "rgba(13,15,20,0.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        gap: 16,
      }}>
        {/* Logo */}
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
          <svg width="26" height="26" viewBox="0 0 42 42" fill="none">
            <circle cx="17" cy="17" r="10" stroke="#e8192c" strokeWidth="3.2"/>
            <line x1="24.5" y1="24.5" x2="34" y2="34" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
            <line x1="31" y1="37" x2="36" y2="32" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
          </svg>
        </button>

        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>McBook</span>

        <span style={{ color: "var(--border)", fontSize: 18, margin: "0 4px" }}>|</span>

        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text2)" }}>Dashboard</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}
            title="Toggle theme"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Book new slot */}
          <button
            onClick={() => navigate("/slots")}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 13px", borderRadius: 7,
              background: "var(--red)", color: "#fff",
              border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--red-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--red)"}
          >
            <PlusIcon /> Book a slot
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 13px", borderRadius: 7,
              background: "transparent", color: "var(--text2)",
              border: "1px solid var(--border)", cursor: "pointer",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text3)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
          >
            <LogOutIcon /> Log out
          </button>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <div className="mc-fade" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 4 }}>
            My Appointments
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
            {confirmed} confirmed &nbsp;·&nbsp; {pending} pending &nbsp;·&nbsp; {appointments.length} total
          </p>
        </div>

        {/* ── TWO-COL ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

          {/* LEFT — appointments list */}
          <div>
            {/* Filter tabs */}
            <div style={{
              display: "flex", gap: 2,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 9, padding: 3,
              marginBottom: 14,
              boxShadow: "var(--shadow-sm)",
              width: "fit-content",
            }}>
              {[
                { key: "all",          label: "All" },
                { key: "office_hours", label: "Office Hours" },
                { key: "group",        label: "Group Meetings" },
                { key: "request",      label: "Requests" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: "5px 13px", borderRadius: 6, border: "none",
                    fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
                    cursor: "pointer", transition: "all 0.15s",
                    background: filter === tab.key ? "var(--red)" : "transparent",
                    color: filter === tab.key ? "#fff" : "var(--text2)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "40px 24px",
                textAlign: "center", color: "var(--text3)",
                fontSize: 13.5,
              }}>
                No appointments here yet.{" "}
                <button onClick={() => navigate("/slots")} style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }}>
                  Book one →
                </button>
              </div>
            ) : (
              filtered.map((appt, i) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  delay={i * 0.05}
                  onDelete={() => setDeleteConfirm(appt.id)}
                  confirmingDelete={deleteConfirm === appt.id}
                  onConfirmDelete={() => handleDelete(appt.id)}
                  onCancelDelete={() => setDeleteConfirm(null)}
                />
              ))
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div>
            {/* Quick actions */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: 18,
              boxShadow: "var(--shadow-sm)", marginBottom: 14,
            }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                Quick actions
              </div>
              <button
                onClick={() => navigate("/slots")}
                style={{
                  width: "100%", padding: "9px 14px",
                  background: "var(--red)", color: "#fff",
                  border: "none", borderRadius: 7, cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  marginBottom: 8, transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--red-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--red)"}
              >
                <PlusIcon /> Book a new slot
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%", padding: "9px 14px",
                  background: "transparent", color: "var(--text2)",
                  border: "1px solid var(--border)", borderRadius: 7, cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <LogOutIcon /> Log out
              </button>
            </div>

            {/* Summary */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: 18,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                Summary
              </div>
              {[
                { label: "Confirmed",      val: confirmed },
                { label: "Pending",        val: pending },
                { label: "Office Hours",   val: appointments.filter(a => a.type === "office_hours").length },
                { label: "Group Meetings", val: appointments.filter(a => a.type === "group").length },
                { label: "Requests",       val: appointments.filter(a => a.type === "request").length },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: "1px solid var(--border)",
                  fontSize: 13,
                }}>
                  <span style={{ color: "var(--text2)" }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Appointment Card ───────────────────────────────────────────────
function AppointmentCard({ appt, delay, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete }) {
  const [hovered, setHovered] = useState(false);
  const type   = TYPE_CONFIG[appt.type]   || TYPE_CONFIG.office_hours;
  const status = STATUS_CONFIG[appt.status] || STATUS_CONFIG.confirmed;

  return (
    <div
      className="mc-fade"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hovered ? "rgba(232,25,44,0.35)" : "var(--border)"}`,
        borderRadius: 10,
        padding: "16px 18px",
        marginBottom: 12,
        boxShadow: hovered
          ? "0 0 0 3px rgba(232,25,44,0.08), var(--shadow-sm)"
          : "var(--shadow-sm)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{
              padding: "2px 8px", borderRadius: 5,
              fontSize: 11, fontWeight: 600,
              background: type.bg, color: type.color,
            }}>{type.label}</span>
            <span style={{
              padding: "2px 8px", borderRadius: 5,
              fontSize: 11, fontWeight: 600,
              background: status.bg, color: status.color,
            }}>{status.label}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            {appt.title}
          </div>
        </div>

        {/* Owner avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: avatarColor(appt.owner),
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          {initials(appt.owner)}
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 12 }}>
        {[
          { icon: <CalIcon />,   val: appt.date },
          { icon: <ClockIcon />, val: appt.time },
          { icon: <PinIcon />,   val: appt.location },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
            <span style={{ color: "var(--text3)" }}>{m.icon}</span>
            {m.val}
          </div>
        ))}
      </div>

      {/* Owner row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 10, borderTop: "1px solid var(--border)",
      }}>
        <div style={{ fontSize: 12.5, color: "var(--text2)", fontWeight: 500 }}>
          {appt.owner}
        </div>

        {/* Actions */}
        {confirmingDelete ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Remove this booking?</span>
            <button
              onClick={onConfirmDelete}
              style={{
                padding: "4px 10px", borderRadius: 6, border: "none",
                background: "var(--red)", color: "#fff",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
              }}
            >Yes</button>
            <button
              onClick={onCancelDelete}
              style={{
                padding: "4px 10px", borderRadius: 6,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text2)", fontSize: 12, fontWeight: 600,
                fontFamily: "inherit", cursor: "pointer",
              }}
            >No</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            {/* Email owner */}
            <a
              href={`mailto:${appt.ownerEmail}?subject=Re: ${encodeURIComponent(appt.title)}`}
              title={`Email ${appt.owner}`}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 11px", borderRadius: 6,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text2)", fontSize: 12, fontWeight: 600,
                fontFamily: "inherit", cursor: "pointer", textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text3)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
            >
              <MailIcon /> Email owner
            </a>

            {/* Delete */}
            <button
              onClick={onDelete}
              title="Cancel booking"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 11px", borderRadius: 6,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text2)", fontSize: 12, fontWeight: 600,
                fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,25,44,0.4)"; e.currentTarget.style.color = "var(--red)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
            >
              <TrashIcon /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
