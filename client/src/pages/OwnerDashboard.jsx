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
import useWindowWidth from "../hooks/useWindowWidth";
// ⚠️ UPDATED: Import API functions instead of mock data
import { getOwnerSlots, deleteSlot as apiDeleteSlot, updateSlot, createSlot, finalizeGroupSlot as apiFinalizeGroup, getOwnerRequests, updateMeetingRequest } from "../services/api";

const TABS = [
  { key: "slots", label: "My Slots" },
  { key: "requests", label: "Meeting Requests" },
];

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
      {children}
    </div>
  );
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const isMobile = useWindowWidth() < 768;
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [tab, setTab] = useState("slots");
  const [slots, setSlots] = useState([]);  // ⚠️ UPDATED: Empty array instead of mock data
  const [requests, setRequests] = useState([]);  // ⚠️ UPDATED: Empty array
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [finalizeSlot, setFinalizeSlot] = useState(null);
  const [loading, setLoading] = useState(true);  // ⚠️ NEW: Loading state

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  // ⚠️ NEW: Load slots from API on mount
  useEffect(() => {
    loadSlots();
    loadRequests();
  }, []);

  async function loadSlots() {
    try {
      const data = await getOwnerSlots();
      // Transform API data to add display fields
      const transformedSlots = data.map(slot => ({
        ...slot,
        date: formatDate(slot.start_time),
        time: formatTime(slot.start_time, slot.end_time),
        location: slot.location || 'TBD', // Use real location from database
        bookings: slot.bookings || []
      }));
      setSlots(transformedSlots);
    } catch (err) {
      console.error('Failed to load slots:', err);
      alert('Failed to load slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Format "2024-12-20 14:00:00" to "Friday, December 20, 2024"
  function formatDate(datetimeStr) {
    if (!datetimeStr) return 'TBD';
    const date = new Date(datetimeStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Format start/end times to "2:00pm – 3:00pm"
  function formatTime(startStr, endStr) {
    if (!startStr || !endStr) return 'TBD';
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const formatTimeOnly = (date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }).toLowerCase();
    };
    
    return `${formatTimeOnly(start)} – ${formatTimeOnly(end)}`;
  }

  async function loadRequests() {
    try {
      const data = await getOwnerRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  }

  // ⚠️ UPDATED: Now calls real API
  async function toggleStatus(id) {
    const slot = slots.find(s => s.id === id);
    const newStatus = slot.status === "active" ? "private" : "active";
    
    // Optimistic update
    setSlots(prev => prev.map(s =>
      s.id === id ? { ...s, status: newStatus } : s
    ));

    try {
      await updateSlot(id, { status: newStatus });
    } catch (err) {
      console.error('Error updating slot status:', err);
      // Revert on error
      setSlots(prev => prev.map(s =>
        s.id === id ? { ...s, status: slot.status } : s
      ));
      alert('Failed to update slot status');
    }
  }

  // ⚠️ UPDATED: Now calls real API
  async function deleteSlot(id) {
    const slot = slots.find(s => s.id === id);
    
    // Notify users via email (client-side mailto)
    if (slot.bookings && slot.bookings.length > 0) {
      slot.bookings.forEach(b => {
        const userName = b.email ? b.email.split('@')[0] : 'Student';
        window.open(`mailto:${b.email}?subject=Booking Cancelled: ${encodeURIComponent(slot.title)}&body=Hi ${userName},%0A%0AYour booking for "${slot.title}" has been cancelled.%0A%0AApologies for any inconvenience.`);
      });
    }

    // Optimistic update
    const oldSlots = slots;
    setSlots(prev => prev.filter(s => s.id !== id));
    setDeleteSlotId(null);

    try {
      await apiDeleteSlot(id);
    } catch (err) {
      console.error('Error deleting slot:', err);
      setSlots(oldSlots); // Restore on error
      alert('Failed to delete slot');
    }
  }

  function copyInviteLink(token) {
    const url = `${window.location.origin}/vote/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  // ⚠️ UPDATED: Now calls real API
  async function handleRequest(id, action) {
    // Optimistic update
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    
    const req = requests.find(r => r.id === id);
    if (action === "accepted" && req) {
      const userName = req.requester_email ? req.requester_email.split('@')[0] : 'Student';
      window.open(`mailto:${req.requester_email}?subject=Meeting Request Accepted&body=Hi ${userName},%0A%0AYour meeting request has been accepted. I will follow up with a confirmed time shortly.%0A%0ABest regards`);
    }

    try {
      await updateMeetingRequest(id, action);
    } catch (err) {
      console.error('Error updating request:', err);
      // Revert on error
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'pending' } : r));
      alert('Failed to update meeting request');
    }
  }

  // ⚠️ UPDATED: Now calls real API
  async function addSlot(slot) {
    try {
      // Transform modal data to API format
      const apiSlot = transformSlotForAPI(slot);
      const newSlot = await createSlot(apiSlot);
      
      // Transform API response to add display fields
      const displaySlot = {
        ...newSlot,
        date: formatDate(newSlot.start_time),
        time: formatTime(newSlot.start_time, newSlot.end_time),
        location: newSlot.location || 'TBD', // Use real location from response
        bookings: []
      };
      
      setSlots(prev => [...prev, displaySlot]);
      setShowCreate(false);
    } catch (err) {
      console.error('Error creating slot:', err);
      alert('Failed to create slot. ' + (err.message || ''));
    }
  }

  // Helper function to transform modal data to API format
  function transformSlotForAPI(slot) {
    // The modal sends different formats for different types
    // We need to convert to: { title, type, start_time, end_time, status, is_recurring, recurrence_weeks, location }
    
    if (slot.date && slot.time_start && slot.time_end) {
      // Type 1 or Type 3 format: { date, time_start, time_end }
      const dateStr = slot.date; // e.g., "2024-12-20"
      const startTime = convertTo24Hour(slot.time_start); // e.g., "2:00pm" -> "14:00:00"
      const endTime = convertTo24Hour(slot.time_end); // e.g., "3:00pm" -> "15:00:00"
      
      return {
        title: slot.title,
        type: slot.type,
        status: slot.status || 'private',
        start_time: `${dateStr} ${startTime}`,
        end_time: `${dateStr} ${endTime}`,
        is_recurring: slot.is_recurring || false,
        recurrence_weeks: slot.recurrence_weeks || null,
        invite_token: slot.invite_token || null,
        location: slot.location || 'TBD'
      };
    } else if (slot.slots && slot.slots.length > 0) {
      // Type 2 format: { slots: [{day, time}] } - use first slot's time
      const firstSlot = slot.slots[0];
      // Parse "Monday, December 20" and "2:00pm – 3:00pm" format
      return {
        title: slot.title,
        type: 'group',
        status: 'active',
        start_time: parseGroupSlotTime(firstSlot.day, firstSlot.time.split(' – ')[0]),
        end_time: parseGroupSlotTime(firstSlot.day, firstSlot.time.split(' – ')[1]),
        is_recurring: false,
        recurrence_weeks: null,
        invite_token: slot.invite_token,
        location: slot.location || 'TBD'
      };
    } else if (slot.group_slots && slot.group_slots.length > 0) {
      // Type 3 format with multiple time slots
      const firstSlot = slot.group_slots[0];
      return {
        title: slot.title,
        type: slot.type || 'office_hours',
        status: 'active',
        start_time: parseGroupSlotTime(firstSlot.date, firstSlot.time.split(' – ')[0]),
        end_time: parseGroupSlotTime(firstSlot.date, firstSlot.time.split(' – ')[1]),
        is_recurring: slot.is_recurring || false,
        recurrence_weeks: slot.recurrence_weeks || null,
        invite_token: null,
        location: slot.location || 'TBD'
      };
    }
    
    // Fallback - return as is and hope for the best
    return slot;
  }

  // Convert "2:00pm" to "14:00:00"
  function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(/(am|pm)/i);
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier.toLowerCase() === 'pm') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${String(hours).padStart(2, '0')}:${minutes || '00'}:00`;
  }

  // Parse "Monday, December 20" + "2:00pm" into "2024-12-20 14:00:00"
  function parseGroupSlotTime(dayStr, timeStr) {
    // This is a simplified version - for production you'd want better date parsing
    const now = new Date();
    const year = now.getFullYear();
    
    // Extract month and day from "Monday, December 20"
    const parts = dayStr.split(', ');
    const [monthName, day] = parts[1].split(' ');
    
    const monthMap = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    
    const month = monthMap[monthName];
    const dateStr = `${year}-${month}-${day.padStart(2, '0')}`;
    const time24 = convertTo24Hour(timeStr);
    
    return `${dateStr} ${time24}`;
  }

  // ⚠️ UPDATED: Now calls real API
  async function finalizeGroupSlotHandler(slotId, selectedGroupSlot, isRecurring, recurrenceWeeks) {
    try {
      await apiFinalizeGroup(slotId, selectedGroupSlot.time, isRecurring, recurrenceWeeks);
      
      // Optimistic update
      setSlots(prev => prev.map(s =>
        s.id === slotId ? { 
          ...s, 
          finalized: true, 
          start_time: selectedGroupSlot.time,
          is_recurring: isRecurring, 
          recurrence_weeks: recurrenceWeeks 
        } : s
      ));
      
      setFinalizeSlot(null);
    } catch (err) {
      console.error('Error finalizing group slot:', err);
      alert('Failed to finalize group meeting');
    }
  }

  const pendingCount = requests.filter(r => r.status === "pending").length;

  const filteredSlots = slots.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.title?.toLowerCase().includes(q) || 
           (s.bookings && s.bookings.some(b => b.email?.toLowerCase().includes(q)));
  });

  const filteredRequests = requests.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.requester_email?.toLowerCase().includes(q) || r.message?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 14, color: "var(--text3)" }}>Loading...</div>
      </div>
    );
  }

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
            {slots.length} slots &nbsp;·&nbsp; {slots.reduce((a, s) => a + (s.bookings?.length || 0), 0)} total bookings &nbsp;·&nbsp; {pendingCount} pending requests
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
          placeholder={tab === "slots" ? "Search by slot title or student email…" : "Search by student email or message…"}
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
                    { label: "Total bookings", val: slots.reduce((a, s) => a + (s.bookings?.length || 0), 0) },
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
          onFinalize={(selected, isRecurring, weeks) => finalizeGroupSlotHandler(finalizeSlot.id, selected, isRecurring, weeks)}
        />
      )}
    </div>
  );
}