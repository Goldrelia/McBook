import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import TimeDropdown from "../components/TimeDropdown";
import { Search, Calendar, Clock, MapPin, Repeat, Check, Plus, X, Mail, Send} from "lucide-react";

const DEFAULT_ICON_SIZE = 13;

// -- Mock data
const MOCK_OWNERS = [
  {
    id: 1,
    name: "Joseph P Vybihal",
    email: "joseph.vybihaltest@mcgill.ca",
    role: "Professor",
    department: "COMP",
    slots: [
      { id: 101, day: "Monday", time: "10:00am – 11:00am", location: "Trottier 3090", weeks: 13, booked: false },
      { id: 102, day: "Wednesday", time: "10:00am – 11:00am", location: "Trottier 3090", weeks: 13, booked: false },
      { id: 103, day: "Tuesday", time: "2:00pm – 3:00pm", location: "Online (Zoom)", weeks: 13, booked: true },
    ],
  },
  {
    id: 2,
    name: "Derek Long",
    email: "derek.long500@mail.mcgill.ca",
    role: "Teaching Assistant",
    department: "COMP",
    slots: [
      { id: 201, day: "Friday", time: "1:00pm – 2:00pm", location: "Online (Zoom)", weeks: 8, booked: false },
      { id: 202, day: "Tuesday", time: "3:00pm – 4:00pm", location: "Trottier 3120", weeks: 8, booked: false },
    ],
  },
  {
    id: 3,
    name: "Sara Alami",
    email: "sara.alami900@mail.mcgill.ca",
    role: "Teaching Assistant",
    department: "COMP",
    slots: [
      { id: 301, day: "Thursday", time: "11:00am – 12:00pm", location: "McConnell 320", weeks: 10, booked: false },
    ],
  },
];

// -- BrowseSlotsPage
export default function BrowseSlotsPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [query, setQuery] = useState("");
  const [owners, setOwners] = useState(MOCK_OWNERS);
  const [booking, setBooking] = useState(null);
  const [booked, setBooked] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requested, setRequested] = useState(null);
  const [requestOwner, setRequestOwner] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  const filtered = query.trim()
    ? owners.filter(o =>
      o.name.toLowerCase().includes(query.toLowerCase()) ||
      o.department.toLowerCase().includes(query.toLowerCase()) ||
      o.role.toLowerCase().includes(query.toLowerCase())
    )
    : owners;

  function handleReserve(owner, slot) {
    setBooking({ owner, slot });
  }

  function confirmReservation() {
    if (!booking) return;
    setOwners(prev => prev.map(o =>
      o.id === booking.owner.id
        ? { ...o, slots: o.slots.map(s => s.id === booking.slot.id ? { ...s, booked: true } : s) }
        : o
    ));
    const subject = encodeURIComponent(`Office Hours Booking: ${booking.slot.day} ${booking.slot.time}`);
    const body = encodeURIComponent(`Hi ${booking.owner.name.split(" ")[0]},\n\nI have reserved your office hours slot on ${booking.slot.day} at ${booking.slot.time} (${booking.slot.location}).\n\nBest regards`);
    window.open(`mailto:${booking.owner.email}?subject=${subject}&body=${body}`);
    setBooked(booking);
    setBooking(null);
    // TODO: POST /api/bookings
  }

  function submitRequest(form) {
    const owner = owners.find(o => o.id === parseInt(form.ownerId));
    const subject = encodeURIComponent(`Meeting Request: ${form.title}`);
    const body = encodeURIComponent(`Hi ${owner.name.split(" ")[0]},\n\nI'd like to request a meeting.\n\nTitle: ${form.title}\nDate: ${form.date}\nTime: ${form.time_start} – ${form.time_end}\n\nMessage:\n${form.message}\n\nBest regards`);
    window.open(`mailto:${owner.email}?subject=${subject}&body=${body}`);
    setRequested(owner);
    setShowRequest(false);
    // TODO: POST /api/meeting-requests
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Navbar
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
        title="Browse Slots"
        actions={[
          { label: "← Dashboard", variant: "outline", onClick: () => navigate("/dashboard") },
        ]}
      />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <div className="mc-fade" style={{ marginBottom: 24 }}>
          <div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 4 }}>
                Book a Slot
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
                Browse available office hours or request a custom meeting.
              </p>
            </div>

          </div>
        </div>

        {/* Success banners */}
        {booked && (
          <div className="mc-fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 9, marginBottom: 20, fontSize: 13.5 }}>
            <span style={{ color: "#10b981", display: "flex" }}><Check size={DEFAULT_ICON_SIZE}/></span>
            <span style={{ color: "var(--text)" }}>
              Booked <strong>{booked.slot.day} at {booked.slot.time}</strong> with <strong>{booked.owner.name}</strong>. A notification email has been sent.
            </span>
            <button onClick={() => setBooked(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex" }}>
              <X size={DEFAULT_ICON_SIZE} />
            </button>
          </div>
        )}

        {requested && (
          <div className="mc-fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 9, marginBottom: 20, fontSize: 13.5 }}>
            <span style={{ color: "#3b82f6", display: "flex" }}><Mail size={DEFAULT_ICON_SIZE} /></span>
            <span style={{ color: "var(--text)" }}>
              Meeting request sent to <strong>{requested.name}</strong>. You'll be notified when they respond.
            </span>
            <button onClick={() => setRequested(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex" }}>
              <X size={DEFAULT_ICON_SIZE} />
            </button>
          </div>
        )}

        {/* Section label */}
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", marginBottom: 12 }}>
          Available Office Hours
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", display: "flex", pointerEvents: "none" }}>
            <Search size={16}/>
          </div>
          <input
            type="text"
            placeholder="Search by professor name, TA, or department…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="mc-input"
            style={{ paddingLeft: 40, height: 46, fontSize: 14 }}
          />
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
            No results for "{query}". Try a different name or department.
          </Card>
        ) : (
          filtered.map((owner, i) => (
            <OwnerCard
              key={owner.id}
              owner={owner}
              delay={i * 0.05}
              onReserve={slot => handleReserve(owner, slot)}
              onRequest={() => { setShowRequest(true); setRequestOwner(owner); }}
            />
          ))
        )}
      </div>

      {booking && (
        <ReserveModal
          owner={booking.owner}
          slot={booking.slot}
          onConfirm={confirmReservation}
          onClose={() => setBooking(null)}
        />
      )}

      {showRequest && (
        <RequestMeetingModal
          owners={owners}
          preselectedOwner={requestOwner}
          onClose={() => { setShowRequest(false); setRequestOwner(null); }}
          onSubmit={submitRequest}
        />
      )}
    </div>
  );
}

// -- Owner Card
function OwnerCard({ owner, delay, onReserve, onRequest }) {
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Avatar name={owner.name} size={40} />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{owner.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{owner.role} · {owner.department}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 5, background: available.length > 0 ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.1)", color: available.length > 0 ? "#10b981" : "var(--text3)" }}>
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
            <Send size={DEFAULT_ICON_SIZE} /> Request
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {owner.slots.map(slot => (
          <SlotRow key={slot.id} slot={slot} ownerEmail={owner.email} ownerName={owner.name} onReserve={() => onReserve(slot)} />
        ))}
      </div>
    </div>
  );
}

// -- Slot Row
function SlotRow({ slot, ownerEmail, ownerName, onReserve }) {
  const [btnHov, setBtnHov] = useState(false);
  const [mailHov, setMailHov] = useState(false);
  const [rowHov, setRowHov] = useState(false);

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
      }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
          <Calendar size={DEFAULT_ICON_SIZE} /> {slot.day}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
          <Clock size={DEFAULT_ICON_SIZE} /> {slot.time}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
          <MapPin size={DEFAULT_ICON_SIZE} /> {slot.location}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text3)" }}>
          <Repeat size={DEFAULT_ICON_SIZE} /> {slot.weeks}w
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {/* Direct email button */}
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
          <Mail size={DEFAULT_ICON_SIZE} />
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

// -- Reserve Confirm Modal
function ReserveModal({ owner, slot, onConfirm, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={e => e.stopPropagation()} className="mc-fade"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 400, boxSizing: "border-box", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>Confirm reservation</div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>You're about to reserve this office hours slot.</div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 9, marginBottom: 16 }}>
          <Avatar name={owner.name} size={38} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{owner.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{owner.role}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {[
            { icon: <Calendar size={DEFAULT_ICON_SIZE}/>, label: slot.day },
            { icon: <Clock size={DEFAULT_ICON_SIZE} />, label: slot.time },
            { icon: <MapPin size={DEFAULT_ICON_SIZE}/>, label: slot.location },
            { icon: <Repeat size={DEFAULT_ICON_SIZE} />, label: `Repeats for ${slot.weeks} weeks` },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text2)" }}>
              <span style={{ color: "var(--text3)" }}>{row.icon}</span> {row.label}
            </div>
          ))}
        </div>

        <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6, marginBottom: 20 }}>
          💡 A notification email will be sent to <strong style={{ color: "var(--text2)" }}>{owner.name}</strong> and this booking will appear on your dashboard.
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text2)", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "var(--red)", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={DEFAULT_ICON_SIZE}/> Confirm booking
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Request Meeting Modal
function RequestMeetingModal({ owners, preselectedOwner, onClose, onSubmit }) {
  const [form, setForm] = useState({ ownerId: String(preselectedOwner?.id || owners[0]?.id || ""), title: "", date: "", time_start: "", time_end: "", message: "" });
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  const isValid = form.ownerId && form.title && form.date && form.time_start && form.time_end && form.message.trim();

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={e => e.stopPropagation()} className="mc-fade"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 460, boxSizing: "border-box", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Request a meeting</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 2 }}>Send a one-on-one meeting request to a professor or TA.</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", padding: 4 }}>
            <X size={DEFAULT_ICON_SIZE} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="mc-label">Send to *</label>
            <select
              value={form.ownerId}
              onChange={e => set("ownerId", e.target.value)}
              className="mc-input"
              style={{ cursor: "pointer", appearance: "none" }}
            >
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
              <Send size={DEFAULT_ICON_SIZE}/> Send request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}