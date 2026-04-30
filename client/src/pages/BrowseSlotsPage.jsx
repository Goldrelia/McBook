// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check, Mail, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import SearchInput from "../components/SearchInput";
import TimeDropdown from "../components/TimeDropdown";
import { browseSlots, createBooking, createMeetingRequest, getAllOwners } from "../services/api";

const ICON_SIZE = 13;

export default function BrowseSlotsPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [query, setQuery] = useState("");
  const [slots, setSlots] = useState([]);  
  const [allOwners, setAllOwners] = useState([]);
  const [booking, setBooking] = useState(null);
  const [booked, setBooked] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requested, setRequested] = useState(null);
  const [expandedOwners, setExpandedOwners] = useState({});
  const [requestForm, setRequestForm] = useState({
    ownerId: "",
    ownerQuery: "",
    date: "",
    startTime: "",
    endTime: "",
    topic: "",
    details: "",
  });
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadSlots();
    loadAllOwners();
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

  async function loadAllOwners() {
    try {
      const data = await getAllOwners();
      setAllOwners(data);
    } catch (err) {
      console.error('Failed to load owners:', err);
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
      // Trigger mailto directly from the user's click to avoid popup blockers.
      if (slot?.owner_email) {
        const start = slot.start_time ? new Date(slot.start_time) : null;
        const end = slot.end_time ? new Date(slot.end_time) : null;
        const when =
          start && end
            ? `${start.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}`
            : "";
        const subject = `New booking: ${slot.title || "Office hours"}`;
        const body =
          `Hi,\n\n` +
          `I just booked your office hours slot.\n\n` +
          `${slot.title ? `Course: ${slot.title}\n` : ""}` +
          `${when ? `When: ${when}\n` : ""}` +
          `${slot.location ? `Where: ${slot.location}\n` : ""}` +
          `\nThanks,\n` +
          `Sent from McBook.`;
        const url = `mailto:${slot.owner_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
      }

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
      const selectedOwner = allOwners.find((owner) => String(owner.id) === String(ownerId));
      if (selectedOwner?.email) {
        const ownerFirstName = selectedOwner.name?.split(" ")[0] || "Professor";
        const { date, startTime, endTime, topic, details } = requestForm;
        // Open the email draft immediately from the click gesture context.
        // Using window.location avoids popup blockers that may block window.open after awaits.
        const subject = "New Meeting Request";
        const body =
          `Hi ${ownerFirstName},\n\n` +
          `I am requesting an office hour meeting with the following details:\n\n` +
          `- Preferred date: ${date}\n` +
          `- Preferred time: ${startTime} - ${endTime}\n` +
          `- Topic: ${topic}\n` +
          `${details?.trim() ? `- Additional details: ${details.trim()}\n` : ""}\n` +
          `Thanks,\n` +
          `Sent from McBook.`;
        const url = `mailto:${selectedOwner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
      }

      await createMeetingRequest(ownerId, message);
      setRequested({ owner_email: selectedOwner?.email || "selected professor" });
      setShowRequest(false);
      setRequestForm({
        ownerId: "",
        ownerQuery: "",
        date: "",
        startTime: "",
        endTime: "",
        topic: "",
        details: "",
      });
    } catch (err) {
      console.error('Error submitting meeting request:', err);
      alert('Failed to send meeting request. ' + (err.message || ''));
    }
  }

  function openRequestModal() {
    setRequestForm({
      ownerId: "",
      ownerQuery: "",
      date: "",
      startTime: "",
      endTime: "",
      topic: "",
      details: "",
    });
    setShowRequest(true);
  }

  async function handleSubmitRequest() {
    const { ownerId, date, startTime, endTime, topic, details } = requestForm;
    if (!ownerId || !date || !startTime || !endTime || !topic.trim()) {
      alert("Please select a professor and fill date, time, and topic.");
      return;
    }

    const formattedMessage =
      `Preferred date: ${date}\n` +
      `Preferred time: ${startTime} - ${endTime}\n` +
      `Topic: ${topic.trim()}\n` +
      `${details.trim() ? `Details: ${details.trim()}` : ""}`;

    await submitRequest(ownerId, formattedMessage.trim());
  }

  // Group slots by owner for display (use filtered for display)
  const slotsByOwner = filtered.reduce((acc, slot) => {
    const email = slot.owner_email;
    if (!acc[email]) {
      acc[email] = {
        id: slot.owner_id,
        email: email,
        name: email.split('@')[0].replace('.', ' '),
        slots: []
      };
    }
    acc[email].slots.push(slot);
    return acc;
  }, {});

  const owners = Object.values(slotsByOwner);
  
  const ownerClassCards = owners
    .flatMap((owner) => {
      const byClass = owner.slots.reduce((acc, slot) => {
        const classTitle = (slot.title || "Untitled").trim();
        if (!acc[classTitle]) acc[classTitle] = [];
        acc[classTitle].push(slot);
        return acc;
      }, {});

      return Object.entries(byClass).map(([classTitle, classSlots]) => ({
        cardKey: `${owner.email}::${classTitle}`,
        ownerId: owner.id,
        ownerEmail: owner.email,
        ownerName: owner.name,
        classTitle,
        slots: classSlots.sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ),
      }));
    })
    .sort((a, b) => {
      const ownerCmp = a.ownerEmail.localeCompare(b.ownerEmail);
      if (ownerCmp !== 0) return ownerCmp;
      return a.classTitle.localeCompare(b.classTitle);
    });
  const ownerMatches = requestForm.ownerQuery.trim()
    ? allOwners.filter((owner) => {
        const q = requestForm.ownerQuery.toLowerCase().trim();
        const combined = `${owner.name} (${owner.email})`.toLowerCase();
        return (
          owner.name.toLowerCase().includes(q) ||
          owner.email.toLowerCase().includes(q) ||
          combined.includes(q)
        );
      })
    : [];

  function toggleOwner(email) {
    setExpandedOwners((prev) => ({ ...prev, [email]: !prev[email] }));
  }

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
          <button
            onClick={openRequestModal}
            style={{
              marginTop: 10,
              padding: "7px 12px",
              background: "var(--surface2)",
              color: "var(--text2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Mail size={ICON_SIZE} />
            Request a Meeting
          </button>
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
        {ownerClassCards.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
            {query.trim() ? `No results for "${query}". Try a different search.` : "No available slots at the moment."}
          </Card>
        ) : (
          ownerClassCards.map((card, i) => (
            <Card key={card.cardKey} delay={i * 0.05} style={{ marginBottom: 16 }}>
              <div
                onClick={() => toggleOwner(card.cardKey)}
                style={{
                  marginBottom: 12,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none"
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{card.ownerName}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{card.ownerEmail}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text2)", fontWeight: 600, marginTop: 2 }}>
                    {card.classTitle}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text3)", fontWeight: 600 }}>
                  {card.slots.length} slot{card.slots.length !== 1 ? "s" : ""} {expandedOwners[card.cardKey] ? "▴" : "▾"}
                </div>
              </div>

              {expandedOwners[card.cardKey] && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {card.slots.map((slot) => (
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
                          {' – '}
                          {new Date(slot.end_time).toLocaleString('en-US', { 
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
              )}
              {!expandedOwners[card.cardKey] && (
                <div style={{ fontSize: 12.5, color: "var(--text3)" }}>
                  Click to view available slots
                </div>
              )}
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

      {/* Type 1 Request modal */}
      {showRequest && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, zIndex: 1000
        }}>
          <div style={{
            background: "var(--surface)", borderRadius: 12, padding: 24,
            maxWidth: 460, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Request a Meeting</h3>
            <p style={{ fontSize: 13.5, color: "var(--text3)", marginBottom: 14 }}>
              Choose a professor, preferred time, and your meeting topic.
            </p>
            <input
              value={requestForm.ownerQuery}
              onChange={(e) =>
                setRequestForm((prev) => ({
                  ...prev,
                  ownerQuery: e.target.value,
                  ownerId: "",
                }))
              }
              placeholder="Search professor by name or email"
              style={{
                width: "100%",
                marginBottom: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: 13
              }}
            />
            {requestForm.ownerQuery.trim() && !requestForm.ownerId && (
              <div
                style={{
                  maxHeight: 140,
                  overflowY: "auto",
                  marginBottom: 10,
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--surface2)",
                }}
              >
                {ownerMatches.length === 0 ? (
                  <div style={{ padding: "10px 12px", fontSize: 12.5, color: "var(--text3)" }}>
                    No matching professors found.
                  </div>
                ) : (
                  ownerMatches.slice(0, 8).map((owner) => {
                    const selected = String(requestForm.ownerId) === String(owner.id);
                    return (
                      <button
                        key={owner.id}
                        onClick={() =>
                          setRequestForm((prev) => ({
                            ...prev,
                            ownerId: owner.id,
                            ownerQuery: `${owner.name} (${owner.email})`,
                          }))
                        }
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "9px 12px",
                          border: "none",
                          borderBottom: "1px solid var(--border)",
                          background: selected ? "rgba(232,25,44,0.08)" : "transparent",
                          color: "var(--text)",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 12.5,
                        }}
                      >
                        {owner.name} ({owner.email})
                      </button>
                    );
                  })
                )}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <input
                type="date"
                value={requestForm.date}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, date: e.target.value }))}
                style={{
                  padding: "5px 10px",
                  backgroundColor: requestForm.date ? "rgba(26,115,232,0.1)" : "var(--surface)",
                  border: "1px solid " + (requestForm.date ? "rgba(26,115,232,0.35)" : "var(--border)"),
                  borderRadius: 6,
                  fontSize: 13.5,
                  fontFamily: "inherit",
                  color: requestForm.date ? "#1a73e8" : "var(--text3)",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none"
                }}
              />
              <TimeDropdown 
                value={requestForm.startTime} 
                onChange={(v) => setRequestForm((prev) => ({ ...prev, startTime: v }))} 
                placeholder="Start" 
              />
              <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
              <TimeDropdown 
                value={requestForm.endTime} 
                onChange={(v) => setRequestForm((prev) => ({ ...prev, endTime: v }))} 
                placeholder="End" 
              />
            </div>
            <input
              value={requestForm.topic}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, topic: e.target.value }))}
              placeholder="Meeting topic *"
              style={{
                width: "100%",
                marginBottom: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: 13
              }}
            />
            <textarea
              value={requestForm.details}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, details: e.target.value }))}
              placeholder="Additional details (optional)"
              style={{
                width: "100%",
                minHeight: 90,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: 13
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                onClick={handleSubmitRequest}
                style={{
                  flex: 1, padding: "10px", background: "var(--red)", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Send request
              </button>
              <button
                onClick={() => { setShowRequest(false); }}
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