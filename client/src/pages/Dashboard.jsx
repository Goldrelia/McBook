// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut } from "lucide-react";
import Navbar from "../components/Navbar";
import Btn from "../components/Btn";
import Card from "../components/Card";
import SearchInput from "../components/SearchInput";
import AppointmentCard from "../features/dashboard/AppointmentCard";
import useWindowWidth from "../hooks/useWindowWidth";
import { getUserBookings, cancelBooking as apiCancelBooking, getMyMeetingRequests } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useWindowWidth() < 768;
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [appointments, setAppointments] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [filterKey, setFilterKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadBookings();
  }, []);

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

  async function loadBookings() {
    try {
      const [bookingsData, myRequests] = await Promise.all([
        getUserBookings(),
        getMyMeetingRequests(),
      ]);

      // Transform the data to match what AppointmentCard expects
      const transformedBookings = bookingsData.map(booking => ({
        ...booking,
        // Format date
        date: new Date(booking.start_time).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        // Format time
        time: formatTime(booking.start_time, booking.end_time),
        // Ensure location exists
        location: booking.location || 'TBD'
      }));

      const parseMessageField = (message = "", key) => {
        const line = String(message)
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.toLowerCase().startsWith(`${key.toLowerCase()}:`));
        return line ? line.split(":").slice(1).join(":").trim() : "";
      };

      const transformedPendingRequests = (myRequests || [])
        .filter((req) => req.status === "pending")
        .map((req) => {
          const preferredDate = parseMessageField(req.message, "Preferred date");
          const preferredTime = parseMessageField(req.message, "Preferred time");
          const topic = parseMessageField(req.message, "Topic") || "Meeting request";
          return {
            id: `req-${req.id}`,
            type: "request",
            status: "pending",
            title: topic,
            date: preferredDate || "Pending date",
            time: preferredTime || "Pending time",
            location: "TBD",
            owner_email: req.owner_email,
            isRequestOnly: true,
          };
        });

      setAppointments([...transformedPendingRequests, ...transformedBookings]);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      alert('Failed to load your appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const target = appointments.find(a => a.id === id);
    if (target?.isRequestOnly) {
      return;
    }

    if (target?.owner_email) {
      const subject = encodeURIComponent(`Booking Cancelled: ${target.title}`);
      const body = encodeURIComponent(
        `Hi,\n\nI cancelled my booking for "${target.title}" on ${target.date} at ${target.time}.\n\nRegards`
      );
      window.open(`mailto:${target.owner_email}?subject=${subject}&body=${body}`);
    }

    // Optimistic update
    const oldAppointments = appointments;
    setAppointments(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);

    try {
      await apiCancelBooking(id);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setAppointments(oldAppointments); // Restore on error
      alert('Failed to cancel booking');
    }
  }

  function handleLogout() {
    localStorage.removeItem("mcbook-token");
    localStorage.removeItem("mcbook-role");
    localStorage.removeItem("mcbook-email");
    navigate("/login");
  }

  function changeFilter(key) {
    setFilter(key);
    setFilterKey(k => k + 1);
  }

  const filtered = appointments
    .filter(a => filter === "all" || a.type === filter)
    .filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return a.title?.toLowerCase().includes(q) || a.owner_email?.toLowerCase().includes(q);
    });

  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const pending = appointments.filter(a => a.status === "pending").length;

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
          { label: "Dashboard", onClick: () => navigate("/dashboard"), active: true },
          { label: "About Us", onClick: () => navigate("/about") },
        ]}
        actions={[
          { label: "+ Book a slot", variant: "red", onClick: () => navigate("/slots") },
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

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 280px", gap: 20, alignItems: "start" }}>

          <div>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by title or owner email…"
              style={{ marginBottom: 14 }}
            />

            {/* Filter tabs */}
            <div style={{
              display: "flex", gap: 2,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 9, padding: 3, marginBottom: 14,
              boxShadow: "var(--shadow-sm)",
              width: isMobile ? "100%" : "fit-content",
              overflowX: "auto",
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

            {/* Cards */}
            <div key={filterKey}>
              {filtered.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)", fontSize: 13.5 }}>
                  {search.trim() ? `No appointments matching "${search}".` : "No appointments here yet."}{" "}
                  {!search.trim() && (
                    <button onClick={() => navigate("/slots")} style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }}>
                      Book one →
                    </button>
                  )}
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

          {/* Sidebar */}
          {!isMobile && (
            <div style={{ paddingTop: 46 }}>
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                  Quick actions
                </div>
                <Btn variant="red" onClick={() => navigate("/slots")} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
                  <Plus size={14} /> Book a new slot
                </Btn>
                <Btn variant="outline" onClick={handleLogout} style={{ width: "100%", justifyContent: "center" }}>
                  <LogOut size={14} /> Log out
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
          )}
        </div>
      </div>
    </div>
  );
}
