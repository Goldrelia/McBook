import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Check, MapPin, UserRound } from "lucide-react";
import { getSlotByInvite, submitVote, getMyVotes } from "../services/api";

const DEFAULT_ICON_SIZE = 13;

export default function VotePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [selected, setSelected] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
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

      const authToken = localStorage.getItem('mcbook-token');
      if (!authToken) {
        // Not logged in - they can see the page but can't vote yet
        // Don't set error, just skip loading previous votes
        return;
      }

      // Load previous votes if logged in
      try {
        const myVotes = await getMyVotes(token);
        const votedTimes = new Set(myVotes);
        setSelected(votedTimes);
      } catch (err) {
        console.log('No previous votes found');
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
      setSubmitted(true);
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
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Invite link not found</div>
          <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 24 }}>
            {error || 'This link may have expired or been removed.'}
          </div>
          <button onClick={() => navigate("/")} style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Go home
          </button>
        </div>
      </div>
    );
  }

  // Submitted confirmation
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#10b981" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.02em" }}>Availability submitted!</div>
          <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 6, lineHeight: 1.6 }}>
            Your availability has been recorded for <strong style={{ color: "var(--text2)" }}>{data.title}</strong>.
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text3)", marginBottom: 24 }}>
            You selected <strong style={{ color: "var(--text2)" }}>{selected.size}</strong> slot{selected.size !== 1 ? "s" : ""}. The owner will finalize the time and notify everyone.
          </div>
          <button onClick={() => navigate("/")} style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Back to McBook
          </button>
        </div>
      </div>
    );
  }

  // Use the actual group slot options from the database
  const timeSlots = (data.group_slot_options || []).map(option => {
    const dateOnly = option.option_date.split('T')[0];
    const startDateTime = new Date(`${dateOnly}T${option.start_time}`);
    const endDateTime = new Date(`${dateOnly}T${option.end_time}`);

    const dateStr = startDateTime.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const startTime = startDateTime.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const endTime = endDateTime.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return {
      time: option.id,
      display: `${dateStr} at ${startTime} – ${endTime}`
    };
  });

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
        </div>

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
                  {/* Checkbox */}
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

        {/* Selected summary */}
        {selected.size > 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(232,25,44,0.05)", border: "1px solid rgba(232,25,44,0.2)", borderRadius: 8, fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
            ✅ <strong style={{ color: "var(--text)" }}>{selected.size}</strong> slot{selected.size !== 1 ? "s" : ""} selected
          </div>
        )}

        {/* Submit */}
        {!localStorage.getItem('mcbook-token') ? (
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(232,25,44,0.05)', border: '1px solid rgba(232,25,44,0.2)', borderRadius: 8 }}>
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
            <Check size={DEFAULT_ICON_SIZE} /> Submit my availability
          </button>
        )}
      </div>
    </div>
  );
}
