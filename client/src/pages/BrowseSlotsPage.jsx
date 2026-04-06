// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check, Mail, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import SearchInput from "../components/SearchInput";
import OwnerCard from "../features/browse/OwnerCard";
import ReserveModal from "../features/browse/ReserveModal";
import RequestMeetingModal from "../features/browse/RequestMeetingModal";
import { MOCK_OWNERS } from "../features/browse/mockData";

const ICON_SIZE = 13;

// -- BrowseSlotsPage
export default function BrowseSlotsPage() {
  const navigate = useNavigate();
  const [theme, setTheme]           = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [query, setQuery]           = useState("");
  const [owners, setOwners]         = useState(MOCK_OWNERS);
  const [booking, setBooking]       = useState(null);
  const [booked, setBooked]         = useState(null);
  const [showRequest, setShowRequest]   = useState(false);
  const [requested, setRequested]       = useState(null);
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
    const body    = encodeURIComponent(`Hi ${booking.owner.name.split(" ")[0]},\n\nI have reserved your office hours slot on ${booking.slot.day} at ${booking.slot.time} (${booking.slot.location}).\n\nBest regards`);
    window.open(`mailto:${booking.owner.email}?subject=${subject}&body=${body}`);
    setBooked(booking);
    setBooking(null);
    // TODO: POST /api/bookings
  }

  function submitRequest(form) {
    const owner   = owners.find(o => o.id === parseInt(form.ownerId));
    const subject = encodeURIComponent(`Meeting Request: ${form.title}`);
    const body    = encodeURIComponent(`Hi ${owner.name.split(" ")[0]},\n\nI'd like to request a meeting.\n\nTitle: ${form.title}\nDate: ${form.date}\nTime: ${form.time_start} – ${form.time_end}\n\nMessage:\n${form.message}\n\nBest regards`);
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
        navLinks={[
          { label: "Dashboard", onClick: () => navigate("/dashboard") },
          { label: "About Us",  onClick: () => navigate("/about") },
        ]}
        actions={[
          { label: "← Dashboard", variant: "outline", onClick: () => navigate("/dashboard") },
        ]}
      />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <div className="mc-fade" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 4 }}>
            Book a Slot
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
            Browse available office hours or request a custom meeting.
          </p>
        </div>

        {/* Success banners */}
        {booked && (
          <div className="mc-fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 9, marginBottom: 20, fontSize: 13.5 }}>
            <span style={{ color: "#10b981", display: "flex" }}><Check size={ICON_SIZE} /></span>
            <span style={{ color: "var(--text)" }}>
              Booked <strong>{booked.slot.day} at {booked.slot.time}</strong> with <strong>{booked.owner.name}</strong>. A notification email has been sent.
            </span>
            <button onClick={() => setBooked(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex" }}>
              <X size={ICON_SIZE} />
            </button>
          </div>
        )}

        {requested && (
          <div className="mc-fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 9, marginBottom: 20, fontSize: 13.5 }}>
            <span style={{ color: "#3b82f6", display: "flex" }}><Mail size={ICON_SIZE} /></span>
            <span style={{ color: "var(--text)" }}>
              Meeting request sent to <strong>{requested.name}</strong>. You'll be notified when they respond.
            </span>
            <button onClick={() => setRequested(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex" }}>
              <X size={ICON_SIZE} />
            </button>
          </div>
        )}

        {/* Section label */}
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", marginBottom: 12 }}>
          Available Office Hours
        </div>

        {/* Search */}
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by professor name, TA, or department…"
          style={{ marginBottom: 20 }}
        />

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