// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
// Derek Long - 261161918
// Wei-Sen Wang - 261116291

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import Btn from "../components/Btn";
import Card from "../components/Card";
import SearchInput from "../components/SearchInput";
import SlotCard from "../features/owner/SlotCard";
import RequestCard from "../features/owner/RequestCard";
import { CreateSlotModal, FinalizeGroupModal } from "../features/owner/CreateSlotModal";
import { MOCK_SLOTS, MOCK_REQUESTS } from "../features/owner/mockData";
import useWindowWidth from "../hooks/useWindowWidth";
import { createSlot, getOwnerSlots, getOwnerRequests, finalizeGroupMeeting } from "../services/api";

const TABS = [
  { key: "slots", label: "My Slots" },
  { key: "requests", label: "Meeting Requests" },
];

// -- SectionTitle
function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
      {children}
    </div>
  );
}

// -- OwnerDashboard
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const isMobile = useWindowWidth() < 768;
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [tab, setTab] = useState("slots");
  const [slots, setSlots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [finalizeSlot, setFinalizeSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadSlots();
    loadRequests();
  }, []);

  async function loadSlots() {
    try {
      const data = await getOwnerSlots();
      const transformedSlots = data.map(slot => {
        const totalVoters = slot.voter_count || 0;

        return {
          ...slot,
          date: formatDate(slot.start_time),
          time: formatTime(slot.start_time, slot.end_time),
          location: slot.location || 'TBD',
          bookings: slot.bookings || [],
          group_slot_options: slot.group_slot_options || [],
          totalVoters
        };
      });
      setSlots(transformedSlots);
    } catch (err) {
      console.error('Failed to load slots:', err);
      alert('Failed to load slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(datetimeStr) {
    return new Date(datetimeStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function formatTime(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const formatTimeOnly = (date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12 || 12;
      const minuteStr = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : '';
      return `${hours}${minuteStr}${ampm}`;
    };
    return `${formatTimeOnly(start)} – ${formatTimeOnly(end)}`;
  }

  async function loadRequests() {
    try {
      const data = await getOwnerRequests();
      const transformedRequests = data.map(req => ({
        ...req,
        user: req.requester_email?.split('@')[0].replace('.', ' ') || 'Student',
        email: req.requester_email
      }));
      setRequests(transformedRequests);
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  }

  function toggleStatus(id) {
    const slot = slots.find(s => s.id === id);
    const newStatus = slot.status === "active" ? "private" : "active";

    // Update UI immediately (optimistic update)
    setSlots(prev => prev.map(s =>
      s.id === id ? { ...s, status: newStatus } : s
    ));

    // Send to backend
    fetch(`/api/slots/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('mcbook-token')}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update status');
        }
      })
      .catch(error => {
        console.error('Error updating slot status:', error);
        // Revert on error
        setSlots(prev => prev.map(s =>
          s.id === id ? { ...s, status: slot.status } : s
        ));
      });
  }

  async function deleteSlot(id) {
    //we are making the function async, cleaner error handling
    const slot = slots.find(s => s.id === id);
    //here we are basically notifying users
    slot.bookings.forEach(b => {
      window.open(`mailto:${b.email}?subject=Booking Cancelled: ${encodeURIComponent(slot.title)}&body=Hi ${b.user.split(" ")[0]},%0A%0AYour booking for "${slot.title}" has been cancelled.%0A%0AApologies for any inconvenience.`);
    });

    const oldSlots = slots;
    setSlots(prev => prev.filter(s => s.id !== id));
    setDeleteSlotId(null);

    try {
      const res = await fetch(`/api/slots/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mcbook-token')}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to delete slot");
      }
    } catch (err) {
      console.error("Error deleting slot:", err);
      setSlots(oldSlots); // restore on failure
    }


  }

  function copyInviteLink(token) {
    const url = `${window.location.origin}/vote/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  async function handleRequest(id, action) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    const req = requests.find(r => r.id === id);
    if (action === "accepted") {
      window.open(`mailto:${req.email}?subject=Meeting Request Accepted&body=Hi ${req.user.split(" ")[0]},%0A%0AYour meeting request has been accepted. I will follow up with a confirmed time shortly.%0A%0ABest regards`);
    }

    try {
      const res = await fetch(`/api/meeting-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('mcbook-token')}`
        },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) {
        throw new Error("Failed to update request");
      }
    } catch (err) {
      console.error("Error updating request:", err);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "pending" } : r));
    }
  }


  // Transform slot data from modal format to API format
  function transformSlotForAPI(slot) {
    // Type 2 (Group Meeting) - pass through group_slot_options
    if (slot.type === "group" && slot.group_slot_options) {
      return {
        title: slot.title,
        type: slot.type,
        status: slot.status,
        start_time: `${slot.date} ${convertTo24Hour(slot.time_start)}`,
        end_time: `${slot.date} ${convertTo24Hour(slot.time_end)}`,
        location: slot.location,
        is_recurring: false,
        recurrence_weeks: null,
        invite_token: slot.invite_token,
        group_slot_options: slot.group_slot_options
      };
    }

    // Type 1 & Type 3 - standard format
    return {
      title: slot.title,
      type: slot.type,
      status: slot.status,
      start_time: `${slot.date} ${convertTo24Hour(slot.time_start)}`,
      end_time: `${slot.date} ${convertTo24Hour(slot.time_end)}`,
      location: slot.location,
      is_recurring: slot.is_recurring || false,
      recurrence_weeks: slot.recurrence_weeks || null
    };
  }

  // Convert "2:00pm" to "14:00:00"
  function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(/(am|pm)/i);
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (modifier.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`;
  }

  async function addSlot(slot) {
    try {
      const transformedSlot = transformSlotForAPI(slot);
      const newSlot = await createSlot(transformedSlot);

      // Transform the new slot to match the format expected by UI
      const transformedNewSlot = {
        ...newSlot,
        date: formatDate(newSlot.start_time),
        time: formatTime(newSlot.start_time, newSlot.end_time),
        location: newSlot.location || 'TBD',
        bookings: newSlot.bookings || []  // Ensure bookings is always an array
      };

      setSlots(prev => [...prev, transformedNewSlot]);
      setShowCreate(false);

    } catch (err) {
      console.error("Error creating slot:", err);
      alert("Failed to create slot: " + err.message);
    }
  }

  async function finalizeGroupSlot(slotId, selectedGroupSlot, isRecurring, recurrenceWeeks) {
    try {
      await finalizeGroupMeeting(slotId, selectedGroupSlot.id, isRecurring, recurrenceWeeks);

      setSlots(prev => prev.map(s =>
        s.id === slotId ? {
          ...s,
          finalized: true,
          date: selectedGroupSlot.date,
          time: selectedGroupSlot.time,
          is_recurring: isRecurring,
          recurrence_weeks: recurrenceWeeks
        } : s
      ));

      setFinalizeSlot(null);
    } catch (err) {
      console.error('Error finalizing group meeting:', err);
      alert('Failed to finalize meeting: ' + err.message);
    }
  }

  const pendingCount = requests.filter(r => r.status === "pending").length;

  const filteredSlots = slots.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.bookings.some(b => b.user.toLowerCase().includes(q));
  });

  const filteredRequests = requests.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.user.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Navbar
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
        navLinks={[
          { label: "Owner Dashboard", onClick: () => navigate("/owner/dashboard"), active: true },
          { label: "About Us", onClick: () => navigate("/about") },
        ]}
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
        <div style={{ display: "flex", gap: 2, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: 3, marginBottom: 20, width: isMobile ? "100%" : "fit-content", overflowX: "auto", boxShadow: "var(--shadow-sm)" }}>
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

        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tab === "slots" ? "Search by slot title or student name…" : "Search by student name or email…"}
          style={{ marginBottom: 20, maxWidth: isMobile ? "100%" : 400 }}
        />

        {/* Slots tab */}
        {tab === "slots" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 260px", gap: 20, alignItems: "start" }}>
            <div>
              {filteredSlots.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
                  {search.trim() ? `No slots matching "${search}".` : "No slots yet."}{" "}
                  {!search.trim() && <button onClick={() => setShowCreate(true)} style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }}>Create one →</button>}
                </Card>
              ) : (
                filteredSlots.map((slot, i) => (
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
            {!isMobile && (
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
                    <Plus size={14} /> New slot
                  </Btn>
                  <Btn variant="outline" onClick={() => setTab("requests")} style={{ width: "100%", justifyContent: "center" }}>
                    View requests {pendingCount > 0 && `(${pendingCount})`}
                  </Btn>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Requests tab */}
        {tab === "requests" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 260px", gap: 20, alignItems: "start" }}>
            <div>
              {filteredRequests.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
                  {search.trim() ? `No requests matching "${search}".` : "No meeting requests yet."}
                </Card>
              ) : (
                filteredRequests.map((req, i) => (
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
            {!isMobile && (
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
            )}
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