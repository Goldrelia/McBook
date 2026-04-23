// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check, Mail, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import SearchInput from "../components/SearchInput";
import { browseSlots, createBooking, createMeetingRequest } from "../services/api";

const ICON_SIZE = 13;

export default function BrowseSlotsPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [query, setQuery] = useState("");
  const [slots, setSlots] = useState([]);  
  const [booking, setBooking] = useState(null);
  const [booked, setBooked] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requested, setRequested] = useState(null);
  const [requestOwner, setRequestOwner] = useState(null);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadSlots();
  }, []);

  async function loadSlots() {
    try {
      const data = await browseSlots();
      setSlots(data);
    } catch (err) {
      console.error('Failed to load slots:', err);
      alert('Failed to load available slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = query.trim()
    ? slots.filter(s =>
        s.title?.toLowerCase().includes(query.toLowerCase()) ||
        s.owner_email?.toLowerCase().includes(query.toLowerCase()) ||
        s.type?.toLowerCase().includes(query.toLowerCase())
      )
    : slots;

  async function confirmReservation(slot) {
    try {
      await createBooking(slot.id);
      setBooked({ slot, owner_email: slot.owner_email });
      setBooking(null);
      
      // Reload slots to update availability
      await loadSlots();
    } catch (err) {
      console.error('Error booking slot:', err);
      alert('Failed to book slot. ' + (err.message || 'Please try again.'));
      setBooking(null);
    }
  }

  async function submitRequest(ownerId, message) {
    try {
      await createMeetingRequest(ownerId, message);
      setRequested({ owner_email: requestOwner });
      setShowRequest(false);
      setRequestOwner(null);
    } catch (err) {
      console.error('Error submitting meeting request:', err);
      alert('Failed to send meeting request. ' + (err.message || ''));
    }
  }

  // Group slots by owner for display
  const slotsByOwner = filtered.reduce((acc, slot) => {
    const email = slot.owner_email;
    if (!acc[email]) {
      acc[email] = {
        email: email,
        name: email.split('@')[0].replace('.', ' '),
        slots: []
      };
    }
    acc[email].slots.push(slot);
    return acc;
  }, {});

  const owners = Object.values(slotsByOwner);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "var(--text3)" }}>Loading available slots...</div>
      </div>
    );
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
            Browse available office hours and group meetings.
          </p>
        </div>

        {/* Success banners */}
        {booked && (
          <div className="mc-fade" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 9, marginBottom: 20, fontSize: 13.5 }}>
            <span style={{ color: "#10b981", display: "flex" }}><Check size={ICON_SIZE} /></span>
            <span style={{ color: "var(--text)" }}>
              Booked <strong>{booked.slot.title}</strong>! Check your dashboard to see your booking.
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
              Meeting request sent to <strong>{requested.owner_email}</strong>. You'll be notified when they respond.
            </span>
            <button onClick={() => setRequested(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex" }}>
              <X size={ICON_SIZE} />
            </button>
          </div>
        )}

        {/* Section label */}
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", marginBottom: 12 }}>
          Available Slots
        </div>

        {/* Search */}
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by title, owner, or type…"
          style={{ marginBottom: 20 }}
        />

        {/* Results */}
        {owners.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
            {query.trim() ? `No results for "${query}". Try a different search.` : "No available slots at the moment."}
          </Card>
        ) : (
          owners.map((owner, i) => (
            <Card key={owner.email} delay={i * 0.05} style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{owner.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{owner.email}</div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {owner.slots.map(slot => (
                  <div key={slot.id} style={{
                    padding: "10px 12px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 7,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{slot.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>
                        {new Date(slot.start_time).toLocaleString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => setBooking(slot)}
                      style={{
                        padding: "6px 14px",
                        background: "var(--red)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit"
                      }}
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Booking confirmation modal */}
      {booking && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, zIndex: 1000
        }}>
          <div style={{
            background: "var(--surface)", borderRadius: 12, padding: 24,
            maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Confirm Booking</h3>
            <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 20 }}>
              Book <strong>{booking.title}</strong> on {new Date(booking.start_time).toLocaleString()}?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => confirmReservation(booking)}
                style={{
                  flex: 1, padding: "10px", background: "var(--red)", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setBooking(null)}
                style={{
                  flex: 1, padding: "10px", background: "var(--surface2)", color: "var(--text2)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
