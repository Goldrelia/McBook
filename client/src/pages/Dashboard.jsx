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
import { MOCK_APPOINTMENTS } from "../features/dashboard/appointmentConfig";
import useWindowWidth from "../hooks/useWindowWidth";

// -- Dashboard
export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useWindowWidth() < 768;
  const [theme, setTheme]           = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [filterKey, setFilterKey]   = useState(0); // forces re-mount on filter change for animation

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  function handleDelete(id) {
    setAppointments(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    // TODO: DELETE /api/bookings/:id
  }

  function handleLogout() {
    localStorage.removeItem("mcbook-token");
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
      return a.title.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q);
    });

  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const pending   = appointments.filter(a => a.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Navbar
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
        navLinks={[
          { label: "Dashboard", onClick: () => navigate("/dashboard"), active: true },
          { label: "About Us",  onClick: () => navigate("/about") },
        ]}
        actions={[
          { label: "+ Book a slot", variant: "red", onClick: () => navigate("/slots") },
          { label: "Log out",       variant: "outline", onClick: handleLogout },
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

          {/* Left — appointments list */}
          <div>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by title or owner…"
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
                { key: "all",          label: "All" },
                { key: "office_hours", label: "Office Hours" },
                { key: "group",        label: "Group Meetings" },
                { key: "request",      label: "Requests" },
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

          {/* Right — sidebar, hidden on mobile */}
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
                { label: "Confirmed",      val: confirmed },
                { label: "Pending",        val: pending },
                { label: "Office Hours",   val: appointments.filter(a => a.type === "office_hours").length },
                { label: "Group Meetings", val: appointments.filter(a => a.type === "group").length },
                { label: "Requests",       val: appointments.filter(a => a.type === "request").length },
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