// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
import { useState } from "react";
import { X, Link, Users, Check } from "lucide-react";
import Btn from "../../components/Btn";
import TimeDropdown from "../../components/TimeDropdown";

const ICON_SIZE = 13;

// ─────────────────────────────────────────────────────────────────
// CreateSlotModal — tabbed container for Type 1, 2, 3 forms
// Props:
//   onClose — close the modal
//   onSave  — function(slotObject)
// ─────────────────────────────────────────────────────────────────
export function CreateSlotModal({ onClose, onSave }) {
  const [modalTab, setModalTab] = useState("type1");

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="mc-fade"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 480, boxSizing: "border-box", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Create new slot</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 4 }}>
            <X size={ICON_SIZE} />
          </button>
        </div>

        {/* Type tabs */}
        <div style={{ display: "flex", gap: 2, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: 3, marginBottom: 22 }}>
          {[
            { key: "type1", label: "Type 1" },
            { key: "type2", label: "Type 2" },
            { key: "type3", label: "Type 3" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setModalTab(t.key)}
              style={{
                flex: 1, padding: "6px 10px", borderRadius: 6, border: "none",
                fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                background: modalTab === t.key ? "var(--surface)" : "transparent",
                color: modalTab === t.key ? "var(--text)" : "var(--text3)",
                boxShadow: modalTab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, marginTop: -14 }}>
          {modalTab === "type1" && "Meeting Request — owner accepts/declines user requests"}
          {modalTab === "type2" && "Group Meeting — participants vote on available times"}
          {modalTab === "type3" && "Recurring Office Hours — open slots anyone can reserve"}
        </div>

        {modalTab === "type1" && <Type1Form onClose={onClose} onSave={onSave} />}
        {modalTab === "type2" && <Type2Form onClose={onClose} onSave={onSave} />}
        {modalTab === "type3" && <Type3Form onClose={onClose} onSave={onSave} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Type 1 — Meeting Request slot
// ─────────────────────────────────────────────────────────────────
function Type1Form({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", date: "", time_start: "", time_end: "", location: "", is_recurring: false, recurrence_weeks: "" });
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  const isValid = form.title && form.date && form.time_start && form.time_end;

  function handleSave() {
    if (!isValid) return;
    onSave({
      title: form.title,
      type: "request",
      status: "private",
      date: form.date,  // Keep raw date: "2026-04-24"
      time_start: form.time_start,  // Keep raw time: "12:15am"
      time_end: form.time_end,      // Keep raw time: "12:45am"
      location: form.location || "TBD",
      is_recurring: form.is_recurring,
      recurrence_weeks: form.is_recurring ? parseInt(form.recurrence_weeks) || null : null,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label className="mc-label">Slot title *</label>
        <input className="mc-input" placeholder="e.g. Office Hours — COMP 307" value={form.title} onChange={e => set("title", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Date &amp; time *</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
            style={{ padding: "5px 10px", background: form.date ? "rgba(26,115,232,0.1)" : "var(--surface)", border: "1px solid " + (form.date ? "rgba(26,115,232,0.35)" : "var(--border)"), borderRadius: 6, fontSize: 13.5, fontFamily: "inherit", color: form.date ? "#1a73e8" : "var(--text3)", fontWeight: 500, cursor: "pointer", outline: "none" }}
          />
          <TimeDropdown value={form.time_start} onChange={v => set("time_start", v)} placeholder="Start" />
          <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
          <TimeDropdown value={form.time_end} onChange={v => set("time_end", v)} placeholder="End" />
        </div>
      </div>
      <div>
        <label className="mc-label">Location</label>
        <input className="mc-input" placeholder="e.g. Trottier 3090 or Online (Zoom)" value={form.location} onChange={e => set("location", e.target.value)} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" id="rec1" checked={form.is_recurring} onChange={e => set("is_recurring", e.target.checked)} style={{ cursor: "pointer", accentColor: "var(--red)", width: 15, height: 15 }} />
        <label htmlFor="rec1" style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", cursor: "pointer" }}>Recurring slot</label>
      </div>
      {form.is_recurring && (
        <div>
          <label className="mc-label">Number of weeks</label>
          <input className="mc-input" type="number" min="1" max="52" placeholder="e.g. 13" value={form.recurrence_weeks} onChange={e => set("recurrence_weeks", e.target.value)} />
        </div>
      )}
      <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6 }}>
        💡 This slot starts as <strong style={{ color: "var(--text2)" }}>private</strong>. Activate it from the dashboard to make it visible to students.
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="red" onClick={handleSave} style={{ opacity: isValid ? 1 : 0.5 }}>Create slot</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Type 2 — Group Meeting (2-step: define slots → share invite)
// ─────────────────────────────────────────────────────────────────
function Type2Form({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", location: "", slots: [] });
  const [newSlot, setNewSlot] = useState({ date: "", time_start: "", time_end: "" });
  const [generatedToken] = useState(Math.random().toString(36).slice(2, 10));

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setNS(k, v) { setNewSlot(s => ({ ...s, [k]: v })); }

  function addTimeSlot() {
    if (!newSlot.date || !newSlot.time_start || !newSlot.time_end) return;
    const label = new Date(newSlot.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    setForm(f => ({
      ...f,
      slots: [...f.slots, {
        id: Date.now(),
        date: label,  // Formatted: "Monday, Dec 22"
        rawDate: newSlot.date,  // Raw: "2024-12-22"
        time: `${newSlot.time_start} – ${newSlot.time_end}`,
        votes: 0
      }],
    }));
    setNewSlot({ date: "", time_start: "", time_end: "" });
  }

  function removeSlot(id) {
    setForm(f => ({ ...f, slots: f.slots.filter(s => s.id !== id) }));
  }

  function handleCreate() {
    // First slot is used for the main slot datetime
    const firstSlot = form.slots[0];
    onSave({
      title: form.title,
      type: "group",
      status: "active",
      // Main slot uses first option's time
      date: firstSlot.rawDate,
      time_start: firstSlot.time.split(' – ')[0],
      time_end: firstSlot.time.split(' – ')[1],
      location: form.location || "TBD",
      is_recurring: false,
      recurrence_weeks: null,
      invite_token: generatedToken,
      // Send all voting options to backend
      group_slot_options: form.slots.map(s => ({  // ← FIXED! No extra brackets
        date: s.rawDate,
        start_time: s.time.split(' – ')[0],
        end_time: s.time.split(' – ')[1]
      })),
      // Keep for frontend display
      group_slots: form.slots,
    });
  }

  const inviteUrl = `${window.location.origin}/vote/${generatedToken}`;

  // Step 1
  if (step === 1) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: -8 }}>Step 1 of 2 — Define your available times</div>
      <div>
        <label className="mc-label">Meeting title *</label>
        <input className="mc-input" placeholder="e.g. Project Demo Scheduling" value={form.title} onChange={e => setF("title", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Location</label>
        <input className="mc-input" placeholder="e.g. Trottier 3090 or Online (Zoom)" value={form.location} onChange={e => setF("location", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Add available time slots</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8 }}>
          <input type="date" value={newSlot.date} onChange={e => setNS("date", e.target.value)}
            style={{ padding: "5px 10px", background: newSlot.date ? "rgba(26,115,232,0.1)" : "var(--surface)", border: "1px solid " + (newSlot.date ? "rgba(26,115,232,0.35)" : "var(--border)"), borderRadius: 6, fontSize: 13.5, fontFamily: "inherit", color: newSlot.date ? "#1a73e8" : "var(--text3)", fontWeight: 500, cursor: "pointer", outline: "none" }}
          />
          <TimeDropdown value={newSlot.time_start} onChange={v => setNS("time_start", v)} placeholder="Start" />
          <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
          <TimeDropdown value={newSlot.time_end} onChange={v => setNS("time_end", v)} placeholder="End" />
          <Btn variant="red" onClick={addTimeSlot} style={{ padding: "5px 12px", fontSize: 12, marginLeft: "auto" }}
            disabled={!newSlot.date || !newSlot.time_start || !newSlot.time_end}>
            + Add
          </Btn>
        </div>

        {form.slots.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>No slots added yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {form.slots.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                <div style={{ fontSize: 13, color: "var(--text)" }}>
                  <span style={{ fontWeight: 600 }}>{s.date}</span>
                  <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                  {s.time}
                </div>
                <button onClick={() => removeSlot(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 2, transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
                >
                  <X size={ICON_SIZE} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="red" onClick={() => setStep(2)} style={{ opacity: (form.title && form.slots.length > 0) ? 1 : 0.5 }}
          disabled={!form.title || form.slots.length === 0}>
          Next — Share invite →
        </Btn>
      </div>
    </div>
  );

  // Step 2
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: -8 }}>Step 2 of 2 — Share with participants</div>

      <div style={{ padding: 16, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
          <Users size={ICON_SIZE} /> Invite link ready
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: 10, lineHeight: 1.6 }}>
          Share this link with participants. They'll see your available slots and vote for the times that work for them.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {inviteUrl}
          </div>
          <Btn variant="outline" onClick={() => navigator.clipboard.writeText(inviteUrl)} style={{ fontSize: 12, padding: "5px 10px", flexShrink: 0 }}>
            <Link size={ICON_SIZE} /> Copy
          </Btn>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Your available slots ({form.slots.length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {form.slots.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "#3b82f6" }}>●</span>
              <span style={{ fontWeight: 600 }}>{s.date}</span>
              <span style={{ color: "var(--text3)" }}>·</span>
              {s.time}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6 }}>
        💡 Once participants vote, go to your dashboard and click <strong style={{ color: "var(--text2)" }}>Finalize time</strong> on this slot to pick the winning slot and create the booking.
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <Btn variant="outline" onClick={() => setStep(1)}>← Back</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Save for later</Btn>
          <Btn variant="red" onClick={handleCreate}>Create &amp; publish</Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Type 3 — Recurring Office Hours
// ─────────────────────────────────────────────────────────────────
function Type3Form({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", location: "", weeks: "", slots: [] });
  const [newSlot, setNewSlot] = useState({ day: "Monday", time_start: "", time_end: "" });

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setNS(k, v) { setNewSlot(s => ({ ...s, [k]: v })); }

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  function addSlot() {
    if (!newSlot.time_start || !newSlot.time_end) return;
    setForm(f => ({
      ...f,
      slots: [...f.slots, { id: Date.now(), day: newSlot.day, time: `${newSlot.time_start} – ${newSlot.time_end}` }],
    }));
    setNewSlot(s => ({ ...s, time_start: "", time_end: "" }));
  }

  function removeSlot(id) {
    setForm(f => ({ ...f, slots: f.slots.filter(s => s.id !== id) }));
  }

  const isValid = form.title && form.weeks && form.slots.length > 0;

  function handleSave() {
    if (!isValid) return;

    // Get the first slot to use as the base time
    const firstSlot = form.slots[0];

    // Calculate the next occurrence of the day
    // E.g., if today is Thursday and slot is Monday, find next Monday
    const dayMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
    const targetDay = dayMap[firstSlot.day];
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7; // If 0, use 7 (next week)

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilTarget);
    const dateStr = nextDate.toISOString().split('T')[0]; // "2024-12-22"

    // Extract start and end times
    const [timeStart, timeEnd] = firstSlot.time.split(' – ');

    onSave({
      title: form.title,
      type: "office_hours",
      status: "active",
      date: dateStr,  // Actual date: "2024-12-22"
      time_start: timeStart,  // "2:15pm"
      time_end: timeEnd,  // "6:15pm"
      location: form.location || "TBD",
      is_recurring: true,
      recurrence_weeks: parseInt(form.weeks),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label className="mc-label">Title *</label>
        <input className="mc-input" placeholder="e.g. Office Hours — COMP 307" value={form.title} onChange={e => setF("title", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Location</label>
        <input className="mc-input" placeholder="e.g. Trottier 3090 or Online (Zoom)" value={form.location} onChange={e => setF("location", e.target.value)} />
      </div>
      <div>
        <label className="mc-label">Number of weeks *</label>
        <input className="mc-input" type="number" min="1" max="52" placeholder="e.g. 13 (full semester)" value={form.weeks} onChange={e => setF("weeks", e.target.value)} />
      </div>

      <div>
        <label className="mc-label">Weekly time slots *</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8 }}>
          <select value={newSlot.day} onChange={e => setNS("day", e.target.value)}
            style={{ padding: "5px 10px", background: "rgba(26,115,232,0.1)", border: "1px solid rgba(26,115,232,0.35)", borderRadius: 6, fontSize: 13.5, fontFamily: "inherit", color: "#1a73e8", fontWeight: 500, cursor: "pointer", outline: "none", appearance: "none" }}>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <TimeDropdown value={newSlot.time_start} onChange={v => setNS("time_start", v)} placeholder="Start" />
          <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
          <TimeDropdown value={newSlot.time_end} onChange={v => setNS("time_end", v)} placeholder="End" />
          <Btn variant="red" onClick={addSlot} style={{ padding: "5px 12px", fontSize: 12, marginLeft: "auto" }}
            disabled={!newSlot.time_start || !newSlot.time_end}>
            + Add
          </Btn>
        </div>

        {form.slots.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>No slots added yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {form.slots.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                <div style={{ fontSize: 13, color: "var(--text)" }}>
                  <span style={{ fontWeight: 600 }}>{s.day}</span>
                  <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                  {s.time}
                </div>
                <button onClick={() => removeSlot(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 2, transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
                >
                  <X size={ICON_SIZE} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6 }}>
        💡 These slots repeat every week for <strong style={{ color: "var(--text2)" }}>{form.weeks || "N"} weeks</strong> and are <strong style={{ color: "var(--text2)" }}>immediately public</strong> — any student can reserve them directly.
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="red" onClick={handleSave} style={{ opacity: isValid ? 1 : 0.5 }} disabled={!isValid}>
          Create office hours
        </Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FinalizeGroupModal — pick winning time for a group meeting
// Props:
//   slot       — the group slot object (with group_slots array)
//   onClose    — close the modal
//   onFinalize — function(selectedSlot, isRecurring, weeks)
// ─────────────────────────────────────────────────────────────────
export function FinalizeGroupModal({ slot, onClose, onFinalize }) {
  const [selected, setSelected] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [weeks, setWeeks] = useState("");

  const sorted = [...(slot.group_slots || [])].sort((a, b) => b.votes - a.votes);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="mc-fade"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 460, boxSizing: "border-box", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Finalize meeting time</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 4 }}>
            <X size={ICON_SIZE} />
          </button>
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>{slot.title}</div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 10, letterSpacing: "0.01em", textTransform: "uppercase" }}>
          Select the winning time slot
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {sorted.map((gs, i) => (
            <div
              key={gs.id}
              onClick={() => setSelected(gs)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px",
                background: selected?.id === gs.id ? "rgba(59,130,246,0.08)" : "var(--surface2)",
                border: `1px solid ${selected?.id === gs.id ? "rgba(59,130,246,0.4)" : "var(--border)"}`,
                borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: `2px solid ${selected?.id === gs.id ? "#3b82f6" : "var(--border)"}`,
                  background: selected?.id === gs.id ? "#3b82f6" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "all 0.15s",
                }}>
                  {selected?.id === gs.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{gs.date}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{gs.time}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: 4 }}>Top pick</span>}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>{gs.votes}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>votes</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <input type="checkbox" id="fin-rec" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ cursor: "pointer", accentColor: "var(--red)", width: 15, height: 15 }} />
          <label htmlFor="fin-rec" style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", cursor: "pointer" }}>Make this a recurring event</label>
        </div>

        {isRecurring && (
          <div style={{ marginBottom: 14 }}>
            <label className="mc-label">Number of weeks</label>
            <input className="mc-input" type="number" min="1" max="52" placeholder="e.g. 5" value={weeks} onChange={e => setWeeks(e.target.value)} />
          </div>
        )}

        <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6, marginBottom: 20 }}>
          💡 Selecting a time will create the booking and send a notification email to all participants.
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="red"
            onClick={() => { if (selected) onFinalize(selected, isRecurring, isRecurring ? parseInt(weeks) || null : null); }}
            style={{ opacity: selected ? 1 : 0.5 }} disabled={!selected}>
            <Check size={ICON_SIZE} /> Confirm &amp; notify
          </Btn>
        </div>
      </div>
    </div>
  );
}