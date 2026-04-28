// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
// Derek Long - 261161918
// Wei-Sen Wang - 261116291

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Btn from "../components/Btn";
import Card from "../components/Card";
import CalendarExportBlock from "../components/CalendarExportBlock";
import { buildOwnerSlotsIcs, downloadIcsFile } from "../utils/calendarExport";
import SearchInput from "../components/SearchInput";
import SlotCard from "../features/owner/SlotCard";
import RequestCard from "../features/owner/RequestCard";
import { CreateSlotModal, FinalizeGroupModal } from "../features/owner/CreateSlotModal";
import EditGroupPollModal from "../features/owner/EditGroupPollModal";
import { MOCK_SLOTS, MOCK_REQUESTS } from "../features/owner/mockData";
import useWindowWidth from "../hooks/useWindowWidth";
import {
  API_URL,
  createSlot,
  getOwnerSlots,
  getOwnerRequests,
  finalizeGroupMeeting,
  deleteSlotSeries as apiDeleteSlotSeries,
} from "../services/api";

const TABS = [
  { key: "all_slots", label: "All Slots" },
  { key: "booked_slots", label: "Booked Slots" },
  { key: "free_slots", label: "Free Slots" },
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
  const [tab, setTab] = useState("all_slots");
  const [slots, setSlots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [finalizeSlot, setFinalizeSlot] = useState(null);
  const [titleFilter, setTitleFilter] = useState("all");
  const [meetingTypeFilter, setMeetingTypeFilter] = useState("all");
  const [expandedRecurringGroups, setExpandedRecurringGroups] = useState({});
  const [createdGroupLink, setCreatedGroupLink] = useState(null);
  const [editGroupPollSlot, setEditGroupPollSlot] = useState(null);
  const [exportBookedSlotsOnly, setExportBookedSlotsOnly] = useState(
    () => localStorage.getItem("mcbook-owner-export-booked-only") === "1",
  );

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
        const confirmedBookings = (slot.bookings || []).filter(
          (b) => (b.status || "confirmed") === "confirmed"
        );
        const WEEK_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const groupSlots = (slot.group_slot_options || []).map(opt => {
          const anchor = "2000-01-01";
          const wd = opt.weekday != null && opt.weekday !== "" ? Number(opt.weekday) : NaN;
          const start = new Date(`${anchor}T${String(opt.start_time).slice(0, 8)}`);
          const end = new Date(`${anchor}T${String(opt.end_time).slice(0, 8)}`);
          const startLabel = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          const endLabel = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          const time = `${startLabel} – ${endLabel}`;
          const noConcreteDate =
            opt.option_date == null || opt.option_date === "" || String(opt.option_date) === "null";
          if (noConcreteDate && !Number.isNaN(wd) && wd >= 0 && wd <= 6) {
            return {
              id: opt.id,
              date: WEEK_NAMES[wd],
              time,
              votes: opt.vote_count || 0,
            };
          }
          const dateOnly = String(opt.option_date).split("T")[0];
          const startD = new Date(`${dateOnly}T${opt.start_time}`);
          const endD = new Date(`${dateOnly}T${opt.end_time}`);
          const date = startD.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
          const sL = startD.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          const eL = endD.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          return {
            id: opt.id,
            date,
            time: `${sL} – ${eL}`,
            votes: opt.vote_count || 0,
          };
        });

        return {
          ...slot,
          finalized: Boolean(slot.group_finalized),
          date: formatDate(slot.start_time),
          time: formatTime(slot.start_time, slot.end_time),
          location: slot.location || 'TBD',
          bookings: confirmedBookings,
          group_slot_options: slot.group_slot_options || [],
          group_slots: groupSlots,
          totalVoters
        };
      });
      setSlots(transformedSlots);
      return transformedSlots;
    } catch (err) {
      console.error('Failed to load slots:', err);
      if (String(err.message).includes("Owner access required")) {
        alert('Owner access required. Please log in with an @mcgill.ca account.');
      } else {
        alert('Failed to load slots. Please try again.');
      }
      return null;
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
      const transformedRequests = data
        .filter(req => req.status === "pending")
        .map(req => ({
        ...req,
        user: req.requester_email?.split('@')[0].replace('.', ' ') || 'Student',
        email: req.requester_email
      }));
      setRequests(transformedRequests);
    } catch (err) {
      console.error('Failed to load requests:', err);
      if (String(err.message).includes("Owner access required")) {
        alert('Owner access required. Please log in with an @mcgill.ca account.');
      }
    }
  }

  function handleOwnerExportCalendar() {
    const ics = buildOwnerSlotsIcs(slots, { bookedOnly: exportBookedSlotsOnly });
    if (!ics) {
      alert(
        exportBookedSlotsOnly
          ? "No booked slots with set times to export."
          : "No slots with set times to export. Finalize group polls or create timed slots first.",
      );
      return;
    }
    downloadIcsFile("mcbook-my-slots.ics", ics);
  }

  function handleExportBookedOnlyChange(checked) {
    setExportBookedSlotsOnly(checked);
    localStorage.setItem("mcbook-owner-export-booked-only", checked ? "1" : "0");
  }

  function toggleStatus(id) {
    const slot = slots.find(s => s.id === id);
    const newStatus = slot.status === "active" ? "private" : "active";

    // Update UI immediately (optimistic update)
    setSlots(prev => prev.map(s =>
      s.id === id ? { ...s, status: newStatus } : s
    ));

    // Send to backend
    fetch(`${API_URL}/slots/${id}`, {
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
      const res = await fetch(`${API_URL}/slots/${id}`, {
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

  async function deleteRecurringGroup(recurringSlots, label) {
    if (recurringSlots.length === 0) {
      alert(`No recurring slots found for "${label}".`);
      return;
    }

    const confirmed = window.confirm(
      `Delete all recurring series for "${label}"?`
    );
    if (!confirmed) return;

    const seriesSeeds = [];
    const seen = new Set();
    for (const slot of recurringSlots) {
      const start = new Date(slot.start_time);
      const end = new Date(slot.end_time);
      const key = [
        slot.title,
        slot.location,
        start.getDay(),
        start.getHours(),
        start.getMinutes(),
        end.getHours(),
        end.getMinutes(),
        slot.recurrence_weeks,
      ].join("|");
      if (!seen.has(key)) {
        seen.add(key);
        seriesSeeds.push(slot);
      }
    }

    try {
      for (const seed of seriesSeeds) {
        await apiDeleteSlotSeries(seed.id);
      }
      await loadSlots();
    } catch (err) {
      console.error("Error deleting recurring class series:", err);
      alert("Failed to delete recurring class series: " + err.message);
    }
  }

  function copyInviteLink(token) {
    const url = `${window.location.origin}/vote/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  async function handleRequest(id, action) {
    const req = requests.find(r => r.id === id);
    const previousRequests = requests;
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));

    try {
      const res = await fetch(`${API_URL}/meeting-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('mcbook-token')}`
        },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to update request");
      }

      if (action === "accepted" && req?.email) {
        const firstName = req.user?.split(" ")[0] || "there";
        const subject = encodeURIComponent("Meeting Request Accepted");
        const body = encodeURIComponent(
          `Hi ${firstName},\n\nYour meeting request has been accepted.\n\nBest regards`
        );
        window.open(`mailto:${req.email}?subject=${subject}&body=${body}`);
      }
      if (action === "declined" && req?.email) {
        const firstName = req.user?.split(" ")[0] || "there";
        const subject = encodeURIComponent("Meeting Request Declined");
        const body = encodeURIComponent(
          `Hi ${firstName},\n\nYour meeting request has been declined.\n\nBest regards`
        );
        window.open(`mailto:${req.email}?subject=${subject}&body=${body}`);
      }

      await loadRequests();

      // Accepted requests should immediately surface as appointments.
      if (action === "accepted") {
        await loadSlots();
      }
    } catch (err) {
      console.error("Error updating request:", err);
      if (String(err.message).includes("Owner access required")) {
        alert('Owner access required. Please log in with an @mcgill.ca account.');
      } else {
        alert(`Failed to update request: ${err.message}`);
      }
      setRequests(previousRequests);
    }
  }


  // Transform slot data from modal format to API format
  function transformSlotForAPI(slot) {
    // Type 2 — weekly patterns over a date range (server expands to concrete vote options)
    if (slot.type === "group" && slot.group_poll_weekly_slots?.length) {
      return {
        title: slot.title,
        type: slot.type,
        status: slot.status,
        location: slot.location,
        is_recurring: false,
        recurrence_weeks: null,
        voter_emails: slot.voter_emails,
        group_season_start: slot.group_season_start,
        group_season_end: slot.group_season_end,
        group_poll_weekly_slots: slot.group_poll_weekly_slots,
      };
    }

    // Type 2 legacy — explicit calendar options
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
        group_slot_options: slot.group_slot_options,
        voter_emails: slot.voter_emails,
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
      recurrence_weeks: slot.recurrence_weeks || null,
      weekly_slots: slot.weekly_slots || null
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
      const created = await createSlot(transformedSlot);
      await loadSlots();
      setShowCreate(false);
      if (created && created.type === "group" && created.invite_token) {
        setCreatedGroupLink({
          token: created.invite_token,
          title: created.title,
        });
      }
    } catch (err) {
      console.error("Error creating slot:", err);
      alert("Failed to create slot: " + err.message);
    }
  }

  async function finalizeGroupSlot(slotId, selectedGroupSlot, isRecurring, recurrenceWeeks) {
    const slot = finalizeSlot;
    try {
      const result = await finalizeGroupMeeting(slotId, selectedGroupSlot.id, isRecurring, recurrenceWeeks);

      setFinalizeSlot(null);
      await loadSlots();
      if (result?.notify_emails?.length) {
        const to = result.notify_emails.join(",");
        const loc = slot?.location || "TBD";
        const timeLine = result.final_time_label || `${selectedGroupSlot.date} · ${selectedGroupSlot.time}`;
        const sub = encodeURIComponent(`Confirmed: ${slot?.title || "Group meeting"}`);
        const body = encodeURIComponent(
          `Hi,\n\nThe group meeting time is confirmed.\n\nWhen: ${timeLine}\nWhere: ${loc}\n\nSee you there.\n`
        );
        window.open(`mailto:${to}?subject=${sub}&body=${body}`);
      }
    } catch (err) {
      console.error('Error finalizing group meeting:', err);
      alert('Failed to finalize meeting: ' + err.message);
    }
  }

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const getConfirmedBookingCount = (slot) =>
    (slot.bookings || []).filter((b) => (b.status || "confirmed") === "confirmed").length;
  const slotTitleOptions = Array.from(
    new Set(
      slots
        .filter((s) => s.type !== "request")
        .map((s) => s.title)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const meetingTypeOptions = [
    { key: "all", label: "All Types" },
    { key: "single_office_hours", label: "Single Office Hours" },
    { key: "group", label: "Group Meeting" },
    { key: "recurring", label: "Recurring" },
  ];

  const filteredSlots = slots.filter(s => {
    const confirmedCount = getConfirmedBookingCount(s);
    if (tab === "booked_slots" && confirmedCount === 0) return false;
    if (tab === "free_slots" && confirmedCount > 0) return false;
    if (tab === "requests") return false;

    if (titleFilter !== "all" && s.title !== titleFilter) {
      return false;
    }

    if (meetingTypeFilter === "recurring" && !s.is_recurring) return false;
    if (meetingTypeFilter === "group" && s.type !== "group") return false;
    if (
      meetingTypeFilter === "single_office_hours" &&
      !((s.type === "office_hours" && !s.is_recurring) || s.type === "request")
    ) {
      return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.bookings.some(b => b.user.toLowerCase().includes(q));
  });
  const sortedFilteredSlots = [...filteredSlots].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const recurringGrouped = sortedFilteredSlots
    .filter((s) => s.is_recurring)
    .reduce((acc, slot) => {
      const key = slot.title || "Untitled";
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    }, {});
  const recurringGroupEntries = Object.entries(recurringGrouped).map(([title, groupSlots]) => ({
    title,
    slots: groupSlots.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)),
  }));

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
          {
            label: "Log out",
            variant: "outline",
            onClick: () => {
              localStorage.removeItem("mcbook-token");
              localStorage.removeItem("mcbook-role");
              localStorage.removeItem("mcbook-email");
              navigate("/login");
            },
          },
        ]}
      />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}>

        <div className="mc-fade" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 4 }}>
            Owner Dashboard
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
            {slots.length} slots &nbsp;·&nbsp; {slots.reduce((a, s) => a + getConfirmedBookingCount(s), 0)} total bookings &nbsp;·&nbsp; {pendingCount} pending requests
          </p>
        </div>

        {createdGroupLink && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 10,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                Group meeting created: {createdGroupLink.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }}>
                {window.location.origin}/vote/{createdGroupLink.token}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Btn
                variant="red"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/vote/${createdGroupLink.token}`,
                  );
                }}
              >
                Copy invite link
              </Btn>
              <Btn variant="outline" onClick={() => setCreatedGroupLink(null)}>
                Dismiss
              </Btn>
            </div>
          </div>
        )}

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

        {tab !== "requests" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text3)" }}>Class:</span>
            <Btn
              variant={titleFilter === "all" ? "red" : "outline"}
              onClick={() => setTitleFilter("all")}
              style={{ padding: "6px 10px" }}
            >
              All
            </Btn>
            {slotTitleOptions.map((title) => (
              <Btn
                key={title}
                variant={titleFilter === title ? "red" : "outline"}
                onClick={() => setTitleFilter(title)}
                style={{ padding: "6px 10px" }}
              >
                {title}
              </Btn>
            ))}
          </div>
        )}

        {tab !== "requests" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text3)" }}>Meeting type:</span>
            {meetingTypeOptions.map((opt) => (
              <Btn
                key={opt.key}
                variant={meetingTypeFilter === opt.key ? "red" : "outline"}
                onClick={() => setMeetingTypeFilter(opt.key)}
                style={{ padding: "6px 10px" }}
              >
                {opt.label}
              </Btn>
            ))}
          </div>
        )}

        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={tab === "requests" ? "Search by student name or email…" : "Search by slot title or student name…"}
          style={{ marginBottom: 20, maxWidth: isMobile ? "100%" : 400 }}
        />
        {isMobile && tab !== "requests" && (
          <Card style={{ marginBottom: 20 }}>
            <SectionTitle>Quick actions</SectionTitle>
            <Btn variant="red" onClick={() => setShowCreate(true)} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
              <Plus size={14} /> New slot
            </Btn>
            <CalendarExportBlock
              onExport={handleOwnerExportCalendar}
              showBookedOnlyOption
              bookedOnly={exportBookedSlotsOnly}
              onBookedOnlyChange={handleExportBookedOnlyChange}
            />
            <Btn variant="outline" onClick={() => setTab("requests")} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
              View requests {pendingCount > 0 && `(${pendingCount})`}
            </Btn>
          </Card>
        )}
        {/* Slots tab */}
        {tab !== "requests" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 260px", gap: 20, alignItems: "start" }}>
            <div>
              {meetingTypeFilter === "recurring" ? (
                recurringGroupEntries.length === 0 ? (
                  <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
                    No recurring meetings found for the current filters.
                  </Card>
                ) : (
                  recurringGroupEntries.map((group, i) => (
                    <Card key={group.title} delay={i * 0.05} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)" }}>{group.title}</div>
                          <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{group.slots.length} recurring meetings</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn
                            variant="outline"
                            onClick={() =>
                              setExpandedRecurringGroups((prev) => ({ ...prev, [group.title]: !prev[group.title] }))
                            }
                            style={{ padding: "6px 10px" }}
                          >
                            {expandedRecurringGroups[group.title] ? "Hide meetings" : "Show meetings"}
                          </Btn>
                          <Btn
                            variant="outline"
                            onClick={() => deleteRecurringGroup(group.slots, group.title)}
                            style={{ padding: "6px 10px" }}
                          >
                            <Trash2 size={14} /> Delete recurring
                          </Btn>
                        </div>
                      </div>
                      {expandedRecurringGroups[group.title] && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {group.slots.map((slot, idx) => (
                            <SlotCard
                              key={slot.id}
                              slot={slot}
                              delay={idx * 0.03}
                              onToggle={() => toggleStatus(slot.id)}
                              onDelete={() => setDeleteSlotId(slot.id)}
                              confirmingDelete={deleteSlotId === slot.id}
                              onConfirmDelete={() => deleteSlot(slot.id)}
                              onCancelDelete={() => setDeleteSlotId(null)}
                              onCopyLink={() => copyInviteLink(slot.invite_token)}
                              copied={copiedToken === slot.invite_token}
                              onFinalize={() => setFinalizeSlot(slot)}
                              onEditPollOptions={() => setEditGroupPollSlot(slot)}
                            />
                          ))}
                        </div>
                      )}
                    </Card>
                  ))
                )
              ) : sortedFilteredSlots.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
                  {search.trim() ? `No slots matching "${search}".` : "No slots yet."}{" "}
                  {!search.trim() && <button onClick={() => setShowCreate(true)} style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }}>Create one →</button>}
                </Card>
              ) : (
                sortedFilteredSlots.map((slot, i) => (
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
                    onEditPollOptions={() => setEditGroupPollSlot(slot)}
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
                    { label: "Booked slots", val: slots.filter(s => getConfirmedBookingCount(s) > 0).length },
                    { label: "Free slots", val: slots.filter(s => getConfirmedBookingCount(s) === 0).length },
                    { label: "Total bookings", val: slots.reduce((a, s) => a + getConfirmedBookingCount(s), 0) },
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
                  <CalendarExportBlock
                    onExport={handleOwnerExportCalendar}
                    showBookedOnlyOption
                    bookedOnly={exportBookedSlotsOnly}
                    onBookedOnlyChange={handleExportBookedOnlyChange}
                  />
                  <Btn variant="outline" onClick={() => setTab("requests")} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
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

      {editGroupPollSlot && (
        <EditGroupPollModal
          slot={editGroupPollSlot}
          onClose={() => setEditGroupPollSlot(null)}
          onSaved={async () => {
            const list = await loadSlots();
            setEditGroupPollSlot((prev) => {
              if (!prev || !list) return null;
              return list.find((s) => s.id === prev.id) ?? null;
            });
          }}
        />
      )}
    </div>
  );
}