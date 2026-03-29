import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Mail, Trash2, Plus, LogOut} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Btn from "../components/Btn";
import Card from "../components/Card";
import Avatar from "../components/Avatar";

const ICON_SIZE_CARDS = 13;
const ICON_SIZE_QUICK_ACTIONS = 14;

// -- Mock data
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

// -- Type / status config
const TYPE_CONFIG = {
  office_hours: { label: "Office Hours", color: "var(--red)", bg: "rgba(232,25,44,0.09)" },
  group: { label: "Group Meeting", color: "#3b82f6", bg: "rgba(59,130,246,0.09)" },
  request: { label: "Meeting Request", color: "#10b981", bg: "rgba(16,185,129,0.09)" },
};

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "#10b981", bg: "rgba(16,185,129,0.09)" },
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.09)" },
};

// -- Dashboard
export default function Dashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState("all");
  // filterKey forces re-mount of cards on every filter change, triggering animation
  const [filterKey, setFilterKey] = useState(0);
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  function handleDelete(id) {
    setAppointments(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    // TODO: DELETE /api/bookings/:id
  }

  function handleLogout() {
    localStorage.removeItem("mcbook-token");
    navigate("/login");
  }

  function changeFilter(key) {
    setFilter(key);
    setFilterKey(k => k + 1); // bump key to re-trigger animation
  }

  const filtered = filter === "all"
    ? appointments
    : appointments.filter(a => a.type === filter);

  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const pending = appointments.filter(a => a.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Navbar
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
        title="Dashboard"
        actions={[
          { label: "+ Book a slot", variant: "red", onClick: () => setShowBookModal(true) },
          { label: "Log out", variant: "outline", onClick: handleLogout },
        ]}
      />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}>

        <div className="mc-fade" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 4 }}>
            My Appointments
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
            {confirmed} confirmed &nbsp;·&nbsp; {pending} pending &nbsp;·&nbsp; {appointments.length} total
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

          {/* Left — appointments */}
          <div>
            {/* Filter tabs */}
            <div style={{
              display: "flex", gap: 2,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 9, padding: 3, marginBottom: 14,
              boxShadow: "var(--shadow-sm)", width: "fit-content",
            }}>
              {[
                { key: "all", label: "All" },
                { key: "office_hours", label: "Office Hours" },
                { key: "group", label: "Group Meetings" },
                { key: "request", label: "Requests" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => changeFilter(tab.key)}
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

            {/* Cards — key prop forces re-mount on filter change */}
            <div key={filterKey}>
              {filtered.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
                  No appointments here yet.{" "}
                  <button onClick={() => navigate("/slots")} style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }}>
                    Book one →
                  </button>
                </Card>
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
          </div>

          {/* Right — sidebar aligned to first card */}
          <div style={{ paddingTop: 46 }}>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                Quick actions
              </div>
              <Btn variant="red" onClick={() => navigate("/slots")} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
                <Plus size={ICON_SIZE_QUICK_ACTIONS}/> Book a new slot
              </Btn>
              <Btn variant="outline" onClick={handleLogout} style={{ width: "100%", justifyContent: "center" }}>
                <LogOut size={ICON_SIZE_QUICK_ACTIONS} /> Log out
              </Btn>
            </Card>

            <Card>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                Summary
              </div>
              {[
                { label: "Confirmed", val: confirmed },
                { label: "Pending", val: pending },
                { label: "Office Hours", val: appointments.filter(a => a.type === "office_hours").length },
                { label: "Group Meetings", val: appointments.filter(a => a.type === "group").length },
                { label: "Requests", val: appointments.filter(a => a.type === "request").length },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span style={{ color: "var(--text2)" }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{row.val}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>

      {showBookModal && (
        <BookSlotModal
          onClose={() => setShowBookModal(false)}
          onRequest={() => { setShowBookModal(false); navigate("/request"); }}
          onBrowse={() => { setShowBookModal(false); navigate("/slots"); }}
        />
      )}
    </div>
  );
}

// -- BookSlotModal
function BookSlotModal({ onClose, onRequest, onBrowse }) {
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
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

// -- AppointmentCard
function AppointmentCard({ appt, delay, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete }) {
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
        <Avatar name={appt.owner} size={34} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 12 }}>
        {[
          { icon: <Calendar size={ICON_SIZE_CARDS}/>, val: appt.date },
          { icon: <Clock size={ICON_SIZE_CARDS}/>, val: appt.time },
          { icon: <MapPin size={ICON_SIZE_CARDS} />, val: appt.location },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
            <span style={{ color: "var(--text3)" }}>{m.icon}</span>
            {m.val}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 12.5, color: "var(--text2)", fontWeight: 500 }}>{appt.owner}</div>

        {confirmingDelete ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Remove this booking?</span>
            <Btn variant="red" onClick={onConfirmDelete} style={{ padding: "4px 10px", fontSize: 12 }}>Yes</Btn>
            <Btn variant="outline" onClick={onCancelDelete} style={{ padding: "4px 10px", fontSize: 12 }}>No</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <a
              href={`mailto:${appt.ownerEmail}?subject=Re: ${encodeURIComponent(appt.title)}`}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text2)", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text3)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
            >
              <Mail size={ICON_SIZE_CARDS}/> Email owner
            </a>
            <button
              onClick={onDelete}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text2)", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,25,44,0.4)"; e.currentTarget.style.color = "var(--red)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
            >
              <Trash2 size={ICON_SIZE_CARDS} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
