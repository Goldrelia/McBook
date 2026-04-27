import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Btn from "../components/Btn";
import { Check, UserRound } from "lucide-react";
import { getSlotByInvite, submitVote, getMyVotes } from "../services/api";

const DEFAULT_ICON_SIZE = 13;

function optionDateToYmd(val) {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(val);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  return s.split("T")[0];
}

export default function VotePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [selected, setSelected] = useState(new Set());
  const [saveNotice, setSaveNotice] = useState(false);
  const [hasSavedVote, setHasSavedVote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadSlotData();
  }, [token]);

  async function loadSlotData() {
    try {
      const slotData = await getSlotByInvite(token);
      setData(slotData);

      if (slotData.group_finalized) {
        return;
      }

      const authToken = localStorage.getItem('mcbook-token');
      if (!authToken) {
        return;
      }

      if (slotData.can_vote === false) {
        return;
      }

      try {
        const myVotes = await getMyVotes(token);
        const votedTimes = new Set(myVotes);
        setSelected(votedTimes);
        setHasSavedVote(myVotes.length > 0);
      } catch (err) {
        console.log('No previous votes found');
        setHasSavedVote(false);
      }
    } catch (err) {
      console.error('Failed to load slot:', err);
      setError(err.message || 'Failed to load invite');
    } finally {
      setLoading(false);
    }
  }

  function toggleSlot(time) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(time) ? next.delete(time) : next.add(time);
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) {
      alert('Please select at least one time slot');
      return;
    }

    try {
      await submitVote(token, Array.from(selected));
      setHasSavedVote(true);
      setSaveNotice(true);
      window.setTimeout(() => setSaveNotice(false), 4500);
      const slotData = await getSlotByInvite(token);
      setData(slotData);
      const myVotes = await getMyVotes(token);
      setSelected(new Set(myVotes));
    } catch (err) {
      console.error('Error submitting availability:', err);
      alert('Failed to submit availability. ' + (err.message || 'Please try again.'));
    }
  }

  const isValid = selected.size > 0;

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ fontSize: 14, color: "var(--text3)" }}>Loading...</div>
      </div>
    );
  }

  // Not found / Error
  if (error || !data) {
    const needLogin = String(error || "").toLowerCase().includes("log in");
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            {needLogin ? "Sign in required" : "Can’t open this poll"}
          </div>
          <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 24, lineHeight: 1.5 }}>
            {error || "This link may have expired or been removed."}
          </div>
          {needLogin ? (
            <button
              onClick={() => navigate(`/login?redirect=/vote/${token}`)}
              style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", marginRight: 8 }}
            >
              Log in
            </button>
          ) : null}
          <button onClick={() => navigate("/")} style={{ background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Go home
          </button>
        </div>
      </div>
    );
  }

  if (data.group_finalized) {
    const s = new Date(data.start_time);
    const e = new Date(data.end_time);
    const when = `${s.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · ${s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Navbar transparent theme={theme} onToggle={() => setTheme(t => t === "light" ? "dark" : "light")} />
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px 80px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--red)", marginBottom: 8 }}>Group meeting — final</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12 }}>{data.title}</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 20 }}>
            The organizer has finalized the time. Voting is closed.
          </p>
          <div style={{ padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6 }}>When</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{when}</div>
            {data.location ? (
              <>
                <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6 }}>Where</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{data.location}</div>
              </>
            ) : null}
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ marginTop: 20, background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const WEEK_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const anchor = "2000-01-01";

  const timeSlots = (data.group_slot_options || []).map((option) => {
    const wd = option.weekday != null && option.weekday !== "" ? Number(option.weekday) : NaN;
    const noConcreteDate =
      option.option_date == null ||
      option.option_date === "" ||
      String(option.option_date) === "null";
    const startDateTime = new Date(`${anchor}T${String(option.start_time).slice(0, 8)}`);
    const endDateTime = new Date(`${anchor}T${String(option.end_time).slice(0, 8)}`);
    const startTime = startDateTime.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endTime = endDateTime.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    if (noConcreteDate && !Number.isNaN(wd) && wd >= 0 && wd <= 6) {
      return {
        time: option.id,
        display: `${WEEK_NAMES[wd]} · ${startTime} – ${endTime}`,
      };
    }
    const dateOnly = optionDateToYmd(option.option_date);
    const startFull = new Date(`${dateOnly}T${option.start_time}`);
    const endFull = new Date(`${dateOnly}T${option.end_time}`);
    const dateStr = startFull.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const sT = startFull.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const eT = endFull.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return {
      time: option.id,
      display: `${dateStr} at ${sT} – ${eT}`,
    };
  });

  const authToken = localStorage.getItem("mcbook-token");

  // Main vote page
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Navbar
        transparent
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
      />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div className="mc-fade" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--red)", marginBottom: 8 }}>
            Group Meeting — Availability Poll
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 10 }}>
            {data.title}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 13, color: "var(--text2)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <UserRound size={DEFAULT_ICON_SIZE} /> {data.owner_email}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 12, marginBottom: 0, lineHeight: 1.55 }}>
            You can change your selections anytime until the organizer finalizes the meeting.
          </p>
          {data.group_season_start && data.group_season_end ? (
            <p style={{ fontSize: 12.5, color: "var(--text2)", marginTop: 10, marginBottom: 0, lineHeight: 1.55 }}>
              Organizer indicated a possible window:{" "}
              <strong style={{ color: "var(--text)" }}>
                {String(data.group_season_start).slice(0, 10)} – {String(data.group_season_end).slice(0, 10)}
              </strong>
              . You are choosing a day-of-week and time pattern, not a specific calendar date.
            </p>
          ) : null}
        </div>

        {saveNotice && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 8,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.35)",
              fontSize: 13,
              color: "var(--text2)",
            }}
          >
            Saved. Change your selections above if needed, or use Return to dashboard anytime before the organizer finalizes.
          </div>
        )}

        {/* Slot selection */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18, boxShadow: "var(--shadow-sm)", marginBottom: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.01em" }}>Select all times that work for you</div>
          <div style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 14 }}>You can select multiple slots</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {timeSlots.map((slot, idx) => {
              const isSelected = selected.has(slot.time);
              return (
                <div
                  key={idx}
                  onClick={() => toggleSlot(slot.time)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 14px",
                    background: isSelected ? "rgba(232,25,44,0.05)" : "var(--surface2)",
                    border: `1px solid ${isSelected ? "rgba(232,25,44,0.35)" : "var(--border)"}`,
                    borderRadius: 8, cursor: "pointer",
                    boxShadow: isSelected ? "0 0 0 3px rgba(232,25,44,0.08)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${isSelected ? "var(--red)" : "var(--border)"}`,
                    background: isSelected ? "var(--red)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {isSelected && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{slot.display}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selected.size > 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(232,25,44,0.05)", border: "1px solid rgba(232,25,44,0.2)", borderRadius: 8, fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
            ✅ <strong style={{ color: "var(--text)" }}>{selected.size}</strong> slot{selected.size !== 1 ? "s" : ""} selected
          </div>
        )}

        {data.can_vote === false ? (
          <div style={{ textAlign: "center", padding: 16, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, color: "var(--text2)", marginBottom: 12 }}>
            You can’t update votes on this poll.
          </div>
        ) : !authToken ? (
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(232,25,44,0.05)', border: '1px solid rgba(232,25,44,0.2)', borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
              Please log in to submit your availability
            </div>
            <button
              onClick={() => navigate(`/login?redirect=/vote/${token}`)}
              style={{
                background: "var(--red)", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer"
              }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            style={{
              width: "100%", padding: "12px", borderRadius: 8,
              background: isValid ? "var(--red)" : "var(--border)",
              color: isValid ? "#fff" : "var(--text3)",
              border: "none", cursor: isValid ? "pointer" : "not-allowed",
              fontSize: 14.5, fontWeight: 700, fontFamily: "inherit",
              transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <Check size={DEFAULT_ICON_SIZE} /> {hasSavedVote ? "Update my availability" : "Save my availability"}
          </button>
        )}

        {authToken ? (
          <div style={{ marginTop: 12 }}>
            <Btn
              variant="outline"
              onClick={() => navigate("/dashboard")}
              style={{ width: "100%", justifyContent: "center", padding: "12px 14px", fontSize: 14 }}
            >
              Return to dashboard
            </Btn>
          </div>
        ) : null}
      </div>
    </div>
  );
}
