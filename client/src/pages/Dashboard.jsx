// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut } from "lucide-react";
import Navbar from "../components/Navbar";
import Btn from "../components/Btn";
import Card from "../components/Card";
import CalendarExportBlock from "../components/CalendarExportBlock";
import TopToast from "../components/TopToast";
import { buildStudentAppointmentsIcs, downloadIcsFile } from "../utils/calendarExport";
import SearchInput from "../components/SearchInput";
import AppointmentCard from "../features/dashboard/AppointmentCard";
import useWindowWidth from "../hooks/useWindowWidth";
import { getUserBookings, cancelBooking as apiCancelBooking, getMyMeetingRequests, getStudentGroupPolls } from "../services/api";

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
  const [toast, setToast] = useState(null);
  const [exportConfirmedBookingsOnly, setExportConfirmedBookingsOnly] = useState(() => {
    const v = localStorage.getItem("mcbook-student-export-confirmed-only");
    if (v === null) return true;
    return v === "1";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadBookings();
  }, []);

  /** Legacy: one DB booking for a finalized recurring group slot — show one card per week. */
  function expandRecurringGroupBookings(rows) {
    const out = [];
    for (const b of rows) {
      const weeks = parseInt(b.recurrence_weeks, 10) || 0;
      const finalized = Number(b.group_finalized) === 1;
      const recurring = Number(b.is_recurring) === 1;
      const legacySeries =
        b.type === "group" && finalized && recurring && weeks > 1;

      if (!legacySeries) {
        out.push(b);
        continue;
      }

      const start0 = new Date(b.start_time);
      const end0 = new Date(b.end_time);
      if (Number.isNaN(start0.getTime()) || Number.isNaN(end0.getTime())) {
        out.push(b);
        continue;
      }

      const bookingPk = b.id;
      const pad = (n) => String(n).padStart(2, "0");
      const toLocalT = (d) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

      for (let i = 0; i < weeks; i++) {
        const start = new Date(start0);
        start.setDate(start.getDate() + 7 * i);
        const end = new Date(end0);
        end.setDate(end.getDate() + 7 * i);
        out.push({
          ...b,
          id: `${bookingPk}-occ-${i}`,
          bookingIdForApi: bookingPk,
          start_time: toLocalT(start),
          end_time: toLocalT(end),
        });
      }
    }
    return out;
  }

  function formatTimeOnly(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const minuteStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : "";
    return `${hours}${minuteStr}${ampm}`;
  }

  function formatTime(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${formatTimeOnly(start)} – ${formatTimeOnly(end)}`;
  }

  const LONG_DATE_OPTIONS = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  /** Preferred date from request message → same long form as confirmed bookings (e.g. Monday, April 22, 2026). */
  function formatLongDisplayDate(raw) {
    if (raw == null || !String(raw).trim()) return "Pending date";
    const s = String(raw).trim();
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    let d;
    if (iso) {
      const y = Number(iso[1], 10);
      const mo = Number(iso[2], 10) - 1;
      const day = Number(iso[3], 10);
      d = new Date(y, mo, day);
    } else {
      d = new Date(s);
    }
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", LONG_DATE_OPTIONS);
  }

  /** Parse one side of "10:30pm" or "22:01" from meeting request message → 24h { h, min } */
  function parsePreferredTimePart(part) {
    const p = String(part).trim().toLowerCase().replace(/\./g, "");
    if (!p) return null;
    const m24 = p.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
      const h = Number(m24[1], 10);
      const min = Number(m24[2], 10);
      if (h >= 0 && h <= 23 && min >= 0 && min <= 59) return { h, min };
    }
    const m12 = p.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (m12) {
      let h = Number(m12[1], 10);
      const min = m12[2] != null ? Number(m12[2], 10) : 0;
      const ap = m12[3];
      if (h < 1 || h > 12 || min < 0 || min > 59) return null;
      if (ap === "pm" && h < 12) h += 12;
      if (ap === "am" && h === 12) h = 0;
      return { h, min };
    }
    return null;
  }

  /** Preferred time from request → same 12h range style as confirmed bookings (e.g. 10:01pm – 11:01pm). */
  function formatPreferredTimeRange(preferredDate, preferredTime) {
    if (preferredTime == null || !String(preferredTime).trim()) return "Pending time";
    const timeRaw = String(preferredTime).trim();
    const segments = timeRaw.split(/\s*[-–—]\s*/).map((x) => x.trim()).filter(Boolean);
    if (segments.length === 0) return "Pending time";

    const dateRaw = String(preferredDate ?? "").trim();
    const iso = dateRaw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    let y;
    let mo;
    let day;
    if (iso) {
      y = Number(iso[1], 10);
      mo = Number(iso[2], 10) - 1;
      day = Number(iso[3], 10);
    } else {
      const base = new Date(dateRaw);
      if (Number.isNaN(base.getTime())) return timeRaw;
      y = base.getFullYear();
      mo = base.getMonth();
      day = base.getDate();
    }

    const startClock = parsePreferredTimePart(segments[0]);
    if (!startClock) return timeRaw;
    const endClock = segments[1] ? parsePreferredTimePart(segments[1]) : null;

    const start = new Date(y, mo, day, startClock.h, startClock.min, 0, 0);
    let end = endClock
      ? new Date(y, mo, day, endClock.h, endClock.min, 0, 0)
      : new Date(start.getTime() + 60 * 60 * 1000);
    if (end <= start) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }
    return `${formatTimeOnly(start)} – ${formatTimeOnly(end)}`;
  }

  async function loadBookings() {
    try {
      const [bookingsData, myRequests, groupPolls] = await Promise.all([
        getUserBookings(),
        getMyMeetingRequests(),
        getStudentGroupPolls(),
      ]);

      // Transform the data to match what AppointmentCard expects
      const transformedBookings = expandRecurringGroupBookings(bookingsData).map((booking) => ({
        ...booking,
        bookingIdForApi: booking.bookingIdForApi ?? booking.id,
        date: new Date(booking.start_time).toLocaleDateString("en-US", LONG_DATE_OPTIONS),
        time: formatTime(booking.start_time, booking.end_time),
        location: booking.location || "TBD",
      }));

      const transformedGroupPolls = (groupPolls || []).map((p) => ({
        id: `gpoll-${p.id}`,
        slot_id: p.id,
        type: "group",
        status: "pending",
        groupPollStatus: p.has_voted ? "awaiting_owner" : "need_vote",
        title: p.title,
        date: p.has_voted ? "Pending owner" : "Needs your vote",
        time: p.has_voted
          ? "Your vote is recorded — time not finalized yet"
          : "Vote on the times that work for you",
        location: p.location || "TBD",
        owner_email: p.owner_email,
        invite_token: p.invite_token,
        isGroupPoll: true,
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
            date: formatLongDisplayDate(preferredDate),
            time: formatPreferredTimeRange(preferredDate, preferredTime),
            location: "TBD",
            owner_email: req.owner_email,
            isRequestOnly: true,
            requestPreferredDate: preferredDate,
            requestPreferredTime: preferredTime,
          };
        });

      setAppointments([
        ...transformedPendingRequests,
        ...transformedGroupPolls,
        ...transformedBookings,
      ]);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setToast({ type: "error", message: "Failed to load your appointments. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(appt) {
    if (!appt || appt.isRequestOnly || appt.isGroupPoll) return;

    const bookingIdToCancel = appt.bookingIdForApi ?? appt.id;

    if (appt.owner_email) {
      const subject = encodeURIComponent(`Booking Cancelled: ${appt.title}`);
      const body = encodeURIComponent(
        `Hi,\n\nI cancelled my booking for "${appt.title}" on ${appt.date} at ${appt.time}.\n\nRegards`
      );
      window.open(`mailto:${appt.owner_email}?subject=${subject}&body=${body}`);
    }

    const oldAppointments = appointments;
    setAppointments((prev) =>
      prev.filter((a) => (a.bookingIdForApi ?? a.id) !== bookingIdToCancel),
    );
    setDeleteConfirm(null);

    try {
      await apiCancelBooking(bookingIdToCancel);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setAppointments(oldAppointments); // Restore on error
      setToast({ type: "error", message: "Failed to cancel booking." });
    }
  }

  function handleLogout() {
    localStorage.removeItem("mcbook-token");
    localStorage.removeItem("mcbook-role");
    localStorage.removeItem("mcbook-email");
    navigate("/login");
  }

  function handleExportCalendar() {
    const ics = buildStudentAppointmentsIcs(appointments, {
      confirmedOnly: exportConfirmedBookingsOnly,
    });
    if (!ics) {
      setToast({
        type: "info",
        message: exportConfirmedBookingsOnly
          ? "No confirmed appointments with set times to export. Uncheck the filter to include pending meeting requests."
          : "Nothing to export. Confirmed bookings need slot times; pending requests need a preferred date.",
      });
      return;
    }
    downloadIcsFile("mcbook-my-appointments.ics", ics);
  }

  function handleStudentExportFilterChange(checked) {
    setExportConfirmedBookingsOnly(checked);
    localStorage.setItem("mcbook-student-export-confirmed-only", checked ? "1" : "0");
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
      <TopToast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

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

            {isMobile && (
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
                  Quick actions
                </div>
                <Btn variant="red" onClick={() => navigate("/slots")} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
                  <Plus size={14} /> Book a new slot
                </Btn>
                <CalendarExportBlock
                  onExport={handleExportCalendar}
                  showBookedOnlyOption
                  bookedOnly={exportConfirmedBookingsOnly}
                  onBookedOnlyChange={handleStudentExportFilterChange}
                  filterLabel="When checked, export only confirmed appointments (pending requests are excluded)."
                />
                <Btn variant="outline" onClick={handleLogout} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
                  <LogOut size={14} /> Log out
                </Btn>
              </Card>
            )}

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
                    onConfirmDelete={() => handleDelete(appt)}
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
                <CalendarExportBlock
                  onExport={handleExportCalendar}
                  showBookedOnlyOption
                  bookedOnly={exportConfirmedBookingsOnly}
                  onBookedOnlyChange={handleStudentExportFilterChange}
                  filterLabel="When checked, export only confirmed appointments (pending requests are excluded)."
                />
                <Btn variant="outline" onClick={handleLogout} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
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
