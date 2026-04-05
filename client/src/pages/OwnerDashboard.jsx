import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Btn from "../components/Btn";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import TimeDropdown from "../components/TimeDropdown";
import { Plus, Mail, Trash2, Link, Check, X, Eye, EyeOff, Users, Calendar, Clock, MapPin } from "lucide-react";

const DEFAULT_ICON_SIZE = 13;

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
      { id: 2, user: "Bob Nguyen", email: "bob.nguyen@mail.mcgill.ca" },
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
  {
    id: 3,
    title: "Project Demo Scheduling",
    type: "group",
    status: "active",
    date: "Various",
    time: "Multiple slots",
    location: "TBD",
    is_recurring: false,
    recurrence_weeks: null,
    invite_token: "grp789abc",
    bookings: [],
    group_slots: [
      { id: 1, date: "Monday, April 7", time: "2:00pm – 3:00pm", votes: 3 },
      { id: 2, date: "Monday, April 7", time: "5:00pm – 6:00pm", votes: 1 },
      { id: 3, date: "Tuesday, April 8", time: "9:00am – 10:00am", votes: 5 },
    ],
    finalized: false,
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

// -- SectionTitle
function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
      {children}
    </div>
  );
}

const TABS = [
  { key: "slots", label: "My Slots" },
  { key: "requests", label: "Meeting Requests" },
];

// -- Main Component
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [tab, setTab] = useState("slots");
  const [slots, setSlots] = useState(MOCK_SLOTS);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [finalizeSlot, setFinalizeSlot] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

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
    const url = `${window.location.origin}/vote/${token}`;
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

  function finalizeGroupSlot(slotId, selectedGroupSlot, isRecurring, recurrenceWeeks) {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? {
        ...s,
        finalized: true,
        date: selectedGroupSlot.date,
        time: selectedGroupSlot.time,
        is_recurring: isRecurring,
        recurrence_weeks: recurrenceWeeks,
      } : s
    ));
    setFinalizeSlot(null);
    // TODO: POST /api/slots/finalize
  }

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Navbar
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
        title="Owner Dashboard"
        actions={[
          { label: "+ New slot", variant: "red", onClick: () => setShowCreate(true) },
          { label: "Log out", variant: "outline", onClick: () => { localStorage.removeItem("mcbook-token"); navigate("/login"); } },
        ]}
      />

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
        <div style={{ display: "flex", gap: 2, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: 3, marginBottom: 20, width: "fit-content", boxShadow: "var(--shadow-sm)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "5px 14px", borderRadius: 6, border: "none",
              fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
              background: tab === t.key ? "var(--red)" : "transparent",
              color: tab === t.key ? "#fff" : "var(--text2)", transition: "all 0.15s",
            }}>
              {t.label}
              {t.key === "requests" && pendingCount > 0 && (
                <span style={{ marginLeft: 6, background: tab === "requests" ? "rgba(255,255,255,0.25)" : "var(--red)", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Slots tab */}
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
                    onFinalize={() => setFinalizeSlot(slot)}
                  />
                ))
              )}
            </div>
            <div>
              <Card style={{ marginBottom: 14 }}>
                <SectionTitle>Summary</SectionTitle>
                {[
                  { label: "Total slots", val: slots.length },
                  { label: "Active", val: slots.filter(s => s.status === "active").length },
                  { label: "Private", val: slots.filter(s => s.status === "private").length },
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
                  <Plus size={14}/> New slot
                </Btn>
                <Btn variant="outline" onClick={() => setTab("requests")} style={{ width: "100%", justifyContent: "center" }}>
                  View requests {pendingCount > 0 && `(${pendingCount})`}
                </Btn>
              </Card>
            </div>
          </div>
        )}

        {/* Requests tab */}
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
                  { label: "Pending", val: requests.filter(r => r.status === "pending").length, color: "#f59e0b" },
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

      {showCreate && (
        <CreateSlotModal onClose={() => setShowCreate(false)} onSave={addSlot} />
      )}

      {finalizeSlot && (
        <FinalizeGroupModal
          slot={finalizeSlot}
          onClose={() => setFinalizeSlot(null)}
          onFinalize={(selected, isRecurring, weeks) => finalizeGroupSlot(finalizeSlot.id, selected, isRecurring, weeks)}
        />
      )}
    </div>
  );
}

// -- Slot Card
function SlotCard({ slot, delay, onToggle, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete, onCopyLink, copied, onFinalize }) {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isActive = slot.status === "active";
  const isGroup = slot.type === "group";

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
            {isGroup && (
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                Group Meeting
              </span>
            )}
            {slot.is_recurring && (
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                Recurring · {slot.recurrence_weeks}w
              </span>
            )}
            {isGroup && slot.finalized && (
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                Finalized
              </span>
            )}
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            {slot.title}
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text2)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 10px", flexShrink: 0 }}>
          {isGroup ? `${slot.group_slots?.reduce((a, s) => a + s.votes, 0) || 0} votes` : `${slot.bookings.length} booked`}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", marginBottom: 12, fontSize: 12.5, color: "var(--text2)" }}>
        <span> < Calendar size={DEFAULT_ICON_SIZE}/> {slot.date}</span>
        <span> < Clock size={DEFAULT_ICON_SIZE}/> {slot.time}</span>
        <span> < MapPin size={DEFAULT_ICON_SIZE}/> {slot.location}</span>
      </div>

      {/* Group slot vote counts */}
      {isGroup && slot.group_slots && !slot.finalized && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--text3)", fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
          >
            {expanded ? "▾" : "▸"} {expanded ? "Hide" : "Show"} vote counts ({slot.group_slots.length} slots)
          </button>
          {expanded && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {slot.group_slots.map(gs => (
                <div key={gs.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>
                    <span style={{ fontWeight: 600 }}>{gs.date}</span>
                    <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                    {gs.time}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#3b82f6" }}>{gs.votes} votes</span>
                    <div style={{ width: 60, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#3b82f6", borderRadius: 3, width: `${Math.min(100, (gs.votes / 6) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regular bookings list */}
      {!isGroup && slot.bookings.length > 0 && (
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
                    <Avatar name={b.user} size={26} />
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
                    <Mail size={DEFAULT_ICON_SIZE} /> Email
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Btn variant="outline" onClick={onToggle}>
            {isActive ? <EyeOff size={DEFAULT_ICON_SIZE} /> : <Eye size={DEFAULT_ICON_SIZE} />}
            {isActive ? "Make private" : "Activate"}
          </Btn>
          <Btn variant="outline" onClick={onCopyLink}>
            <Link size={DEFAULT_ICON_SIZE} /> {copied ? "Copied!" : "Copy invite link"}
          </Btn>
          {isGroup && !slot.finalized && (
            <Btn variant="outline" onClick={onFinalize} style={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)" }}>
              <Users size={DEFAULT_ICON_SIZE} /> Finalize time
            </Btn>
          )}
        </div>
        {confirmingDelete ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Delete this slot?</span>
            <Btn variant="red" onClick={onConfirmDelete} style={{ padding: "4px 10px" }}>Yes</Btn>
            <Btn variant="outline" onClick={onCancelDelete} style={{ padding: "4px 10px" }}>No</Btn>
          </div>
        ) : (
          <Btn variant="danger" onClick={onDelete}><Trash2 size={DEFAULT_ICON_SIZE} /> Delete</Btn>
        )}
      </div>
    </div>
  );
}

// -- Request Card
function RequestCard({ req, delay, onAccept, onDecline }) {
  const [hov, setHov] = useState(false);
  const statusConfig = {
    pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
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
          <Mail size={DEFAULT_ICON_SIZE} /> Email
        </a>
        {req.status === "pending" && (
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="green" onClick={onAccept}><Check size={DEFAULT_ICON_SIZE}/> Accept</Btn>
            <Btn variant="danger" onClick={onDecline}><X size={DEFAULT_ICON_SIZE} /> Decline</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// -- Create Slot Modal (Type 1 + Type 2)
function CreateSlotModal({ onClose, onSave }) {
  const [modalTab, setModalTab] = useState("type1");

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="mc-fade"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 480, boxSizing: "border-box", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Create new slot</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 4 }}>
            <X size={DEFAULT_ICON_SIZE} />
          </button>
        </div>

        {/* Type tabs */}
        <div style={{ display: "flex", gap: 2, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: 3, marginBottom: 22 }}>
          {[
            { key: "type1", label: "Type 1" },
            { key: "type2", label: "Type 2" },
            { key: "type3", label: "Type 3" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setModalTab(t.key)}
              style={{
                flex: 1, padding: "6px 10px", borderRadius: 6, border: "none",
                fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                background: modalTab === t.key ? "var(--surface)" : "transparent",
                color: modalTab === t.key ? "var(--text)" : "var(--text3)",
                boxShadow: modalTab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, marginTop: -14 }}>
          {modalTab === "type1" && "Meeting Request — owner accepts/declines user requests"}
          {modalTab === "type2" && "Group Meeting — participants vote on available times"}
          {modalTab === "type3" && "Recurring Office Hours — open slots anyone can reserve"}
        </div>

        {modalTab === "type1" && <Type1Form onClose={onClose} onSave={onSave} />}
        {modalTab === "type2" && <Type2Form onClose={onClose} onSave={onSave} />}
        {modalTab === "type3" && <Type3Form onClose={onClose} onSave={onSave} />}
      </div>
    </div>
  );
}

// -- Type 1 Form
function Type1Form({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", date: "", time_start: "", time_end: "", location: "", is_recurring: false, recurrence_weeks: "" });
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  const isValid = form.title && form.date && form.time_start && form.time_end;

  function handleSave() {
    if (!isValid) return;
    onSave({
      title: form.title, type: "request", status: "private",
      date: new Date(form.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      time: `${form.time_start} – ${form.time_end}`,
      location: form.location || "TBD",
      is_recurring: form.is_recurring,
      recurrence_weeks: form.is_recurring ? parseInt(form.recurrence_weeks) || null : null,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label className="mc-label">Slot title *</label>
        <input className="mc-input" placeholder="e.g. Office Hours — COMP 307" value={form.title} onChange={e => set("title", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Date &amp; time *</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
            style={{ padding: "5px 10px", background: form.date ? "rgba(26,115,232,0.1)" : "var(--surface)", border: "1px solid " + (form.date ? "rgba(26,115,232,0.35)" : "var(--border)"), borderRadius: 6, fontSize: 13.5, fontFamily: "inherit", color: form.date ? "#1a73e8" : "var(--text3)", fontWeight: 500, cursor: "pointer", outline: "none" }}
          />
          <TimeDropdown value={form.time_start} onChange={v => set("time_start", v)} placeholder="Start" />
          <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
          <TimeDropdown value={form.time_end} onChange={v => set("time_end", v)} placeholder="End" />
        </div>
      </div>
      <div>
        <label className="mc-label">Location</label>
        <input className="mc-input" placeholder="e.g. Trottier 3090 or Online (Zoom)" value={form.location} onChange={e => set("location", e.target.value)} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" id="rec1" checked={form.is_recurring} onChange={e => set("is_recurring", e.target.checked)} style={{ cursor: "pointer", accentColor: "var(--red)", width: 15, height: 15 }} />
        <label htmlFor="rec1" style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", cursor: "pointer" }}>Recurring slot</label>
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
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="red" onClick={handleSave} style={{ opacity: isValid ? 1 : 0.5 }}>Create slot</Btn>
      </div>
    </div>
  );
}

// -- Type 2 Form (3-step)
function Type2Form({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", location: "", slots: [] });
  const [newSlot, setNewSlot] = useState({ date: "", time_start: "", time_end: "" });
  const [generatedToken] = useState(Math.random().toString(36).slice(2, 10));

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setNS(k, v) { setNewSlot(s => ({ ...s, [k]: v })); }

  function addTimeSlot() {
    if (!newSlot.date || !newSlot.time_start || !newSlot.time_end) return;
    const label = new Date(newSlot.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    setForm(f => ({
      ...f,
      slots: [...f.slots, { id: Date.now(), date: label, time: `${newSlot.time_start} – ${newSlot.time_end}`, votes: 0 }],
    }));
    setNewSlot({ date: "", time_start: "", time_end: "" });
  }

  function removeSlot(id) {
    setForm(f => ({ ...f, slots: f.slots.filter(s => s.id !== id) }));
  }

  function handleCreate() {
    onSave({
      title: form.title, type: "group", status: "active",
      date: "Various", time: "Multiple slots",
      location: form.location || "TBD",
      is_recurring: false, recurrence_weeks: null,
      invite_token: generatedToken,
      group_slots: form.slots,
      finalized: false,
    });
  }

  const inviteUrl = `${window.location.origin}/vote/${generatedToken}`;

  // Step 1 — Define available slots
  if (step === 1) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: -8 }}>Step 1 of 2 — Define your available times</div>
      <div>
        <label className="mc-label">Meeting title *</label>
        <input className="mc-input" placeholder="e.g. Project Demo Scheduling" value={form.title} onChange={e => setF("title", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Location</label>
        <input className="mc-input" placeholder="e.g. Trottier 3090 or Online (Zoom)" value={form.location} onChange={e => setF("location", e.target.value)} />
      </div>

      <div>
        <label className="mc-label">Add available time slots</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8 }}>
          <input type="date" value={newSlot.date} onChange={e => setNS("date", e.target.value)}
            style={{ padding: "5px 10px", background: newSlot.date ? "rgba(26,115,232,0.1)" : "var(--surface)", border: "1px solid " + (newSlot.date ? "rgba(26,115,232,0.35)" : "var(--border)"), borderRadius: 6, fontSize: 13.5, fontFamily: "inherit", color: newSlot.date ? "#1a73e8" : "var(--text3)", fontWeight: 500, cursor: "pointer", outline: "none" }}
          />
          <TimeDropdown value={newSlot.time_start} onChange={v => setNS("time_start", v)} placeholder="Start" />
          <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
          <TimeDropdown value={newSlot.time_end} onChange={v => setNS("time_end", v)} placeholder="End" />
          <Btn variant="red" onClick={addTimeSlot} style={{ padding: "5px 12px", fontSize: 12, marginLeft: "auto" }}
            disabled={!newSlot.date || !newSlot.time_start || !newSlot.time_end}>
            + Add
          </Btn>
        </div>

        {form.slots.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>No slots added yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {form.slots.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                <div style={{ fontSize: 13, color: "var(--text)" }}>
                  <span style={{ fontWeight: 600 }}>{s.date}</span>
                  <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                  {s.time}
                </div>
                <button onClick={() => removeSlot(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 2, transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
                >
                  <X size={DEFAULT_ICON_SIZE}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="red" onClick={() => setStep(2)} style={{ opacity: (form.title && form.slots.length > 0) ? 1 : 0.5 }}
          disabled={!form.title || form.slots.length === 0}>
          Next — Share invite →
        </Btn>
      </div>
    </div>
  );

  // Step 2 — Share invite link
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: -8 }}>Step 2 of 2 — Share with participants</div>

      <div style={{ padding: 16, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", marginBottom: 6 }}>
          <Users size={DEFAULT_ICON_SIZE} /> &nbsp; Invite link ready
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: 10, lineHeight: 1.6 }}>
          Share this link with participants. They'll see your available slots and vote for the times that work for them.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {inviteUrl}
          </div>
          <Btn variant="outline" onClick={() => { navigator.clipboard.writeText(inviteUrl); }} style={{ fontSize: 12, padding: "5px 10px", flexShrink: 0 }}>
            <Link size={DEFAULT_ICON_SIZE}/> Copy
          </Btn>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Your available slots ({form.slots.length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {form.slots.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "#3b82f6" }}>●</span>
              <span style={{ fontWeight: 600 }}>{s.date}</span>
              <span style={{ color: "var(--text3)" }}>·</span>
              {s.time}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6 }}>
        💡 Once participants vote, go to your dashboard and click <strong style={{ color: "var(--text2)" }}>Finalize time</strong> on this slot to pick the winning slot and create the booking.
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <Btn variant="outline" onClick={() => setStep(1)}>← Back</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Save for later</Btn>
          <Btn variant="red" onClick={handleCreate}>Create &amp; publish</Btn>
        </div>
      </div>
    </div>
  );
}

// -- Finalize Group Slot Modal
function FinalizeGroupModal({ slot, onClose, onFinalize }) {
  const [selected, setSelected] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [weeks, setWeeks] = useState("");

  const sorted = [...(slot.group_slots || [])].sort((a, b) => b.votes - a.votes);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Finalize meeting time</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 4 }}><X size={DEFAULT_ICON_SIZE} /></button>
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>{slot.title}</div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 10, letterSpacing: "0.01em", textTransform: "uppercase" }}>
          Select the winning time slot
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {sorted.map((gs, i) => (
            <div
              key={gs.id}
              onClick={() => setSelected(gs)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px",
                background: selected?.id === gs.id ? "rgba(59,130,246,0.08)" : "var(--surface2)",
                border: `1px solid ${selected?.id === gs.id ? "rgba(59,130,246,0.4)" : "var(--border)"}`,
                borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: `2px solid ${selected?.id === gs.id ? "#3b82f6" : "var(--border)"}`,
                  background: selected?.id === gs.id ? "#3b82f6" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "all 0.15s",
                }}>
                  {selected?.id === gs.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{gs.date}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{gs.time}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: 4 }}>Top pick</span>}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>{gs.votes}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>votes</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <input type="checkbox" id="fin-rec" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ cursor: "pointer", accentColor: "var(--red)", width: 15, height: 15 }} />
          <label htmlFor="fin-rec" style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", cursor: "pointer" }}>Make this a recurring event</label>
        </div>

        {isRecurring && (
          <div style={{ marginBottom: 14 }}>
            <label className="mc-label">Number of weeks</label>
            <input className="mc-input" type="number" min="1" max="52" placeholder="e.g. 5" value={weeks} onChange={e => setWeeks(e.target.value)} />
          </div>
        )}

        <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6, marginBottom: 20 }}>
          💡 Selecting a time will create the booking and send a notification email to all participants.
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="red" onClick={() => { if (selected) onFinalize(selected, isRecurring, isRecurring ? parseInt(weeks) || null : null); }}
            style={{ opacity: selected ? 1 : 0.5 }} disabled={!selected}>
            <Check size={DEFAULT_ICON_SIZE} /> Confirm &amp; notify
          </Btn>
        </div>
      </div>
    </div>
  );
}

// -- Type 3 Form (Recurring Office Hours)
function Type3Form({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", location: "", weeks: "", slots: [] });
  const [newSlot, setNewSlot] = useState({ day: "Monday", time_start: "", time_end: "" });

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setNS(k, v) { setNewSlot(s => ({ ...s, [k]: v })); }

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  function addSlot() {
    if (!newSlot.time_start || !newSlot.time_end) return;
    setForm(f => ({
      ...f,
      slots: [...f.slots, { id: Date.now(), day: newSlot.day, time: `${newSlot.time_start} – ${newSlot.time_end}` }],
    }));
    setNewSlot(s => ({ ...s, time_start: "", time_end: "" }));
  }

  function removeSlot(id) {
    setForm(f => ({ ...f, slots: f.slots.filter(s => s.id !== id) }));
  }

  const isValid = form.title && form.weeks && form.slots.length > 0;

  function handleSave() {
    if (!isValid) return;
    onSave({
      title: form.title,
      type: "office_hours",
      status: "active",
      date: form.slots.map(s => s.day).join(", "),
      time: form.slots.map(s => s.time).join(" / "),
      location: form.location || "TBD",
      is_recurring: true,
      recurrence_weeks: parseInt(form.weeks),
      recurring_slots: form.slots,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label className="mc-label">Title *</label>
        <input className="mc-input" placeholder="e.g. Office Hours — COMP 307" value={form.title} onChange={e => setF("title", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Location</label>
        <input className="mc-input" placeholder="e.g. Trottier 3090 or Online (Zoom)" value={form.location} onChange={e => setF("location", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Number of weeks *</label>
        <input className="mc-input" type="number" min="1" max="52" placeholder="e.g. 13 (full semester)" value={form.weeks} onChange={e => setF("weeks", e.target.value)} />
      </div>

      <div>
        <label className="mc-label">Weekly time slots *</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8 }}>
          <select
            value={newSlot.day}
            onChange={e => setNS("day", e.target.value)}
            style={{ padding: "5px 10px", background: "rgba(26,115,232,0.1)", border: "1px solid rgba(26,115,232,0.35)", borderRadius: 6, fontSize: 13.5, fontFamily: "inherit", color: "#1a73e8", fontWeight: 500, cursor: "pointer", outline: "none", appearance: "none" }}
          >
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <TimeDropdown value={newSlot.time_start} onChange={v => setNS("time_start", v)} placeholder="Start" />
          <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
          <TimeDropdown value={newSlot.time_end} onChange={v => setNS("time_end", v)} placeholder="End" />
          <Btn variant="red" onClick={addSlot} style={{ padding: "5px 12px", fontSize: 12, marginLeft: "auto" }}
            disabled={!newSlot.time_start || !newSlot.time_end}>
            + Add
          </Btn>
        </div>

        {form.slots.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>No slots added yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {form.slots.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                <div style={{ fontSize: 13, color: "var(--text)" }}>
                  <span style={{ fontWeight: 600 }}>{s.day}</span>
                  <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                  {s.time}
                </div>
                <button onClick={() => removeSlot(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 2, transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6 }}>
        💡 These slots repeat every week for <strong style={{ color: "var(--text2)" }}>{form.weeks || "N"} weeks</strong> and are <strong style={{ color: "var(--text2)" }}>immediately public</strong> — any student can reserve them directly from the Browse Slots page.
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="red" onClick={handleSave} style={{ opacity: isValid ? 1 : 0.5 }} disabled={!isValid}>
          Create office hours
        </Btn>
      </div>
    </div>
  );
}
