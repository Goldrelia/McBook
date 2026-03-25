import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Avatar from "../components/Avatar";

// -- Mock data (replace with GET /api/slots?type=office_hours&status=active)
const MOCK_OWNERS = [
  {
    id: 1,
    name: "Joseph P Vybihal",
    email: "joseph.vybihal@mcgill.ca",
    role: "Professor",
    department: "COMP",
    slots: [
      { id: 101, day: "Monday",    time: "10:00am – 11:00am", location: "Trottier 3090",  weeks: 13, booked: false },
      { id: 102, day: "Wednesday", time: "10:00am – 11:00am", location: "Trottier 3090",  weeks: 13, booked: false },
      { id: 103, day: "Tuesday",   time: "2:00pm – 3:00pm",   location: "Online (Zoom)",  weeks: 13, booked: true  },
    ],
  },
  {
    id: 2,
    name: "Derek Long",
    email: "derek.long@mail.mcgill.ca",
    role: "Teaching Assistant",
    department: "COMP",
    slots: [
      { id: 201, day: "Friday",  time: "1:00pm – 2:00pm", location: "Online (Zoom)",   weeks: 8, booked: false },
      { id: 202, day: "Tuesday", time: "3:00pm – 4:00pm", location: "Trottier 3120",   weeks: 8, booked: false },
    ],
  },
  {
    id: 3,
    name: "Sara Alami",
    email: "sara.alami@mail.mcgill.ca",
    role: "Teaching Assistant",
    department: "COMP",
    slots: [
      { id: 301, day: "Thursday", time: "11:00am – 12:00pm", location: "McConnell 320", weeks: 10, booked: false },
    ],
  },
];

// -- Icons
const Icon = ({ d, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SearchIcon  = () => <Icon size={16} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const ClockIcon   = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const PinIcon     = () => <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const CalIcon     = () => <Icon d="M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" />;
const RepeatIcon  = () => <Icon d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />;
const CheckIcon   = () => <Icon d="M20 6L9 17l-5-5" />;
const XIcon       = () => <Icon d="M18 6L6 18M6 6l12 12" />;
const ArrowLeft   = () => <Icon size={15} d="M19 12H5M12 5l-7 7 7 7" />;

// -- BrowseSlotsPage
export default function BrowseSlotsPage() {
  const navigate  = useNavigate();
  const [theme, setTheme]     = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [query, setQuery]     = useState("");
  const [owners, setOwners]   = useState(MOCK_OWNERS);
  const [booking, setBooking] = useState(null); // { owner, slot }
  const [booked, setBooked]   = useState(null); // confirmed booking

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
    // Mark slot as booked
    setOwners(prev => prev.map(o =>
      o.id === booking.owner.id
        ? { ...o, slots: o.slots.map(s => s.id === booking.slot.id ? { ...s, booked: true } : s) }
        : o
    ));
    // Send mailto notification to owner
    const subject = encodeURIComponent(`Office Hours Booking: ${booking.slot.day} ${booking.slot.time}`);
    const body = encodeURIComponent(`Hi ${booking.owner.name.split(" ")[0]},\n\nI have reserved your office hours slot on ${booking.slot.day} at ${booking.slot.time} (${booking.slot.location}).\n\nPlease let me know if this works.\n\nBest regards`);
    window.open(`mailto:${booking.owner.email}?subject=${subject}&body=${body}`);
    setBooked(booking);
    setBooking(null);
    // TODO: POST /api/bookings { slot_id, user_id }
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
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 4 }}>
            Browse Office Hours
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
            Search for a professor or TA and reserve an available slot directly.
          </p>
        </div>

        {/* Success banner */}
        {booked && (
          <div className="mc-fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 9, marginBottom: 20, fontSize: 13.5 }}>
            <span style={{ color: "#10b981", display: "flex" }}><CheckIcon /></span>
            <span style={{ color: "var(--text)" }}>
              Booked <strong>{booked.slot.day} at {booked.slot.time}</strong> with <strong>{booked.owner.name}</strong>. A notification email has been sent.
            </span>
            <button onClick={() => setBooked(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center" }}>
              <XIcon />
            </button>
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <SearchIcon />
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
            />
          ))
        )}
      </div>

      {/* Reservation confirm modal */}
      {booking && (
        <ReserveModal
          owner={booking.owner}
          slot={booking.slot}
          onConfirm={confirmReservation}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}

// -- Owner Card
function OwnerCard({ owner, delay, onReserve }) {
  const [hov, setHov] = useState(false);
  const available = owner.slots.filter(s => !s.booked);
  const booked    = owner.slots.filter(s => s.booked);

  return (
    <div
      className="mc-fade"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hov ? "rgba(232,25,44,0.25)" : "var(--border)"}`,
        borderRadius: 10, padding: "18px 20px", marginBottom: 14,
        boxShadow: hov ? "0 0 0 3px rgba(232,25,44,0.06), var(--shadow-sm)" : "var(--shadow-sm)",
        transition: "border-color 0.15s, box-shadow 0.15s",
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
        <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 5, background: available.length > 0 ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.1)", color: available.length > 0 ? "#10b981" : "var(--text3)" }}>
          {available.length} slot{available.length !== 1 ? "s" : ""} available
        </div>
      </div>

      {/* Slots */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {owner.slots.map(slot => (
          <SlotRow key={slot.id} slot={slot} onReserve={() => onReserve(slot)} />
        ))}
      </div>
    </div>
  );
}

// -- Slot Row
function SlotRow({ slot, onReserve }) {
  const [hov, setHov] = useState(false);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 12px",
      background: slot.booked ? "var(--surface2)" : hov ? "rgba(232,25,44,0.03)" : "var(--surface2)",
      border: `1px solid ${slot.booked ? "var(--border)" : hov ? "rgba(232,25,44,0.2)" : "var(--border)"}`,
      borderRadius: 8,
      transition: "all 0.15s",
      opacity: slot.booked ? 0.6 : 1,
    }}
    onMouseEnter={() => setHov(true)}
    onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
          <CalIcon /> {slot.day}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
          <ClockIcon /> {slot.time}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
          <PinIcon /> {slot.location}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text3)" }}>
          <RepeatIcon /> {slot.weeks}w
        </span>
      </div>

      {slot.booked ? (
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text3)", flexShrink: 0 }}>Reserved</span>
      ) : (
        <button
          onClick={onReserve}
          style={{
            padding: "5px 14px", borderRadius: 6,
            background: hov ? "var(--red)" : "transparent",
            color: hov ? "#fff" : "var(--red)",
            border: "1px solid " + (hov ? "var(--red)" : "rgba(232,25,44,0.3)"),
            fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
          }}
        >
          Reserve
        </button>
      )}
    </div>
  );
}

// -- Reserve Confirm Modal
function ReserveModal({ owner, slot, onConfirm, onClose }) {
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
            { icon: <CalIcon />,    label: slot.day },
            { icon: <ClockIcon />,  label: slot.time },
            { icon: <PinIcon />,    label: slot.location },
            { icon: <RepeatIcon />, label: `Repeats for ${slot.weeks} weeks` },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text2)" }}>
              <span style={{ color: "var(--text3)" }}>{row.icon}</span>
              {row.label}
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
            <CheckIcon /> Confirm booking
          </button>
        </div>
      </div>
    </div>
  );
}
