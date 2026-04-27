// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
import { useState } from "react";
import { X, Users, Check } from "lucide-react";
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
  const [modalTab, setModalTab] = useState("type2");

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
          {modalTab === "type2" && "Group Meeting — participants vote on available times"}
          {modalTab === "type3" && "Recurring Office Hours — open slots anyone can reserve"}
        </div>

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
function parseVoterEmails(text) {
  return String(text || "")
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function Type2Form({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    location: "",
    season_start: "",
    season_end: "",
    weeklySlots: [],
  });
  const [newRow, setNewRow] = useState({ day: "Monday", time_start: "", time_end: "" });
  const [voterEmailsText, setVoterEmailsText] = useState("");

  function setF(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function setNR(k, v) {
    setNewRow((s) => ({ ...s, [k]: v }));
  }

  function addWeeklyRow() {
    if (!newRow.time_start || !newRow.time_end) return;
    setForm((f) => ({
      ...f,
      weeklySlots: [
        ...f.weeklySlots,
        {
          id: Date.now(),
          day: newRow.day,
          time: `${newRow.time_start} – ${newRow.time_end}`,
        },
      ],
    }));
    setNewRow((s) => ({ ...s, time_start: "", time_end: "" }));
  }

  function removeRow(id) {
    setForm((f) => ({ ...f, weeklySlots: f.weeklySlots.filter((s) => s.id !== id) }));
  }

  function handleCreate() {
    const voter_emails = parseVoterEmails(voterEmailsText);
    if (voter_emails.length === 0) return;
    onSave({
      title: form.title,
      type: "group",
      status: "private",
      location: form.location || "TBD",
      voter_emails,
      group_season_start: form.season_start || null,
      group_season_end: form.season_end || null,
      group_poll_weekly_slots: form.weeklySlots.map((s) => {
        const [a, b] = s.time.split(" – ");
        return { day: s.day, time_start: a.trim(), time_end: b.trim() };
      }),
    });
  }

  const seasonOk =
    (!form.season_start && !form.season_end) ||
    (form.season_start && form.season_end && form.season_start <= form.season_end);
  const step1Ok =
    form.title &&
    form.weeklySlots.length > 0 &&
    parseVoterEmails(voterEmailsText).length > 0 &&
    seasonOk;

  // Step 1
  if (step === 1)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: -8 }}>
          Step 1 of 2 — Students pick one weekday + time per option (e.g. Monday 2pm vs Thursday 2pm). Optional window describes roughly when meetings might run.
        </div>
        <div>
          <label className="mc-label">Meeting title *</label>
          <input
            className="mc-input"
            placeholder="e.g. Project Demo Scheduling"
            value={form.title}
            onChange={(e) => setF("title", e.target.value)}
          />
        </div>
        <div>
          <label className="mc-label">Location</label>
          <input
            className="mc-input"
            placeholder="e.g. Trottier 3090 or Online (Zoom)"
            value={form.location}
            onChange={(e) => setF("location", e.target.value)}
          />
        </div>
        <div>
          <label className="mc-label">Students who can vote *</label>
          <textarea
            className="mc-input"
            rows={3}
            placeholder="One @mail.mcgill.ca per line, or comma-separated"
            value={voterEmailsText}
            onChange={(e) => setVoterEmailsText(e.target.value)}
            style={{ resize: "vertical", minHeight: 72, fontSize: 13.5, lineHeight: 1.45 }}
          />
          <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5, marginTop: 6 }}>
            Only these accounts see the poll under <strong style={{ color: "var(--text2)" }}>Group Meetings</strong> on their dashboard.
          </div>
        </div>
        <div>
          <label className="mc-label">Possible meeting window (optional)</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              padding: "8px 12px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 12.5, color: "var(--text3)" }}>From</span>
            <input
              type="date"
              value={form.season_start}
              onChange={(e) => setF("season_start", e.target.value)}
              style={{
                padding: "5px 10px",
                background: form.season_start ? "rgba(26,115,232,0.1)" : "var(--surface)",
                border: `1px solid ${form.season_start ? "rgba(26,115,232,0.35)" : "var(--border)"}`,
                borderRadius: 6,
                fontSize: 13.5,
                fontFamily: "inherit",
                color: form.season_start ? "#1a73e8" : "var(--text3)",
                fontWeight: 500,
                cursor: "pointer",
                outline: "none",
              }}
            />
            <span style={{ fontSize: 12.5, color: "var(--text3)" }}>to</span>
            <input
              type="date"
              value={form.season_end}
              onChange={(e) => setF("season_end", e.target.value)}
              style={{
                padding: "5px 10px",
                background: form.season_end ? "rgba(26,115,232,0.1)" : "var(--surface)",
                border: `1px solid ${form.season_end ? "rgba(26,115,232,0.35)" : "var(--border)"}`,
                borderRadius: 6,
                fontSize: 13.5,
                fontFamily: "inherit",
                color: form.season_end ? "#1a73e8" : "var(--text3)",
                fontWeight: 500,
                cursor: "pointer",
                outline: "none",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5, marginTop: 6 }}>
            Shown to students as context only (e.g. “January–March”). Leave blank if you do not need a range. If you set one date, set both; end must be on or after start.
          </div>
        </div>
        <div>
          <label className="mc-label">Vote choices (weekday + time) *</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              padding: "8px 12px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <select
              value={newRow.day}
              onChange={(e) => setNR("day", e.target.value)}
              style={{
                padding: "5px 10px",
                background: "rgba(26,115,232,0.1)",
                border: "1px solid rgba(26,115,232,0.35)",
                borderRadius: 6,
                fontSize: 13.5,
                fontFamily: "inherit",
                color: "#1a73e8",
                fontWeight: 500,
                cursor: "pointer",
                outline: "none",
                appearance: "none",
              }}
            >
              {WEEKDAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <TimeDropdown value={newRow.time_start} onChange={(v) => setNR("time_start", v)} placeholder="Start" />
            <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
            <TimeDropdown value={newRow.time_end} onChange={(v) => setNR("time_end", v)} placeholder="End" />
            <Btn
              variant="red"
              onClick={addWeeklyRow}
              style={{ padding: "5px 12px", fontSize: 12, marginLeft: "auto" }}
              disabled={!newRow.time_start || !newRow.time_end}
            >
              + Add
            </Btn>
          </div>

          {form.weeklySlots.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>
              No choices yet — e.g. Monday 2:00pm–3:00pm vs Thursday 2:00pm–3:00pm (one row per alternative)
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {form.weeklySlots.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 7,
                  }}
                >
                  <div style={{ fontSize: 13, color: "var(--text)" }}>
                    <span style={{ fontWeight: 600 }}>{s.day}</span>
                    <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                    {s.time}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(s.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text3)",
                      display: "flex",
                      alignItems: "center",
                      padding: 2,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}
                  >
                    <X size={ICON_SIZE} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="red" onClick={() => setStep(2)} style={{ opacity: step1Ok ? 1 : 0.5 }} disabled={!step1Ok}>
            Next — Review →
          </Btn>
        </div>
      </div>
    );

  // Step 2
  const voterList = parseVoterEmails(voterEmailsText);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: -8 }}>Step 2 of 2 — Review &amp; publish</div>

      <div style={{ padding: 16, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
          <Users size={ICON_SIZE} /> Invited voters
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: 8, lineHeight: 1.6 }}>
          {voterList.length} student{voterList.length === 1 ? "" : "s"} will see this under <strong>Group Meetings</strong> with a <strong>needs your vote</strong> status until they respond; then it shows as pending until you finalize the time.
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
          After you publish, the real invite URL appears on your dashboard — the <strong>Copy invite link</strong> button there always matches the server.
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5, marginTop: 8 }}>
          The poll is created as <strong style={{ color: "var(--text2)" }}>private</strong> (only you manage it on the owner dashboard). After you finalize a time, it stays private until you use <strong>Activate</strong> on each meeting card so students see that confirmed meeting under <strong>My Appointments</strong>; <strong>Make private</strong> hides it again.
        </div>
      </div>

      {form.season_start && form.season_end ? (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Possible window</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>
            {form.season_start} → {form.season_end}
          </div>
        </div>
      ) : null}

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
          Vote choices ({form.weeklySlots.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {form.weeklySlots.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 7,
                fontSize: 13,
                color: "var(--text)",
              }}
            >
              <span style={{ color: "#3b82f6" }}>●</span>
              <span style={{ fontWeight: 600 }}>{s.day}</span>
              <span style={{ color: "var(--text3)" }}>·</span>
              {s.time}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 10, lineHeight: 1.55 }}>
          Students vote on each generated date/time in that range. After votes, use <strong>Finalize time</strong> to pick the winning slot and set one-time or recurring meetings.
        </div>
      </div>

      <div style={{ padding: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--text3)", lineHeight: 1.6 }}>
        💡 Same model as Type 3: you define <strong style={{ color: "var(--text2)" }}>day of week + time</strong> rows, not one-off calendar dates. The app lists every matching occurrence in your range as a poll option.
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <Btn variant="outline" onClick={() => setStep(1)}>
          ← Back
        </Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>
            Save for later
          </Btn>
          <Btn variant="red" onClick={handleCreate} style={{ opacity: voterList.length ? 1 : 0.5 }} disabled={!voterList.length}>
            Create &amp; publish
          </Btn>
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

    onSave({
      title: form.title,
      type: "office_hours",
      status: "active",
      // Kept for backwards compatibility with API validation.
      date: new Date().toISOString().split("T")[0],
      time_start: "9:00am",
      time_end: "9:30am",
      location: form.location || "TBD",
      is_recurring: true,
      recurrence_weeks: parseInt(form.weeks),
      weekly_slots: form.slots.map(s => {
        const [start, end] = s.time.split(' – ');
        return { day: s.day, time_start: start, time_end: end };
      }),
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
          💡 Confirming sets the real calendar time (for weekday-only choices, the first matching date in your optional season window, or the next occurrence). Bookings are created for voters on the winning option. If you choose recurring with multiple weeks, the app creates one separate group meeting card per week (same title and voters), not a single “recurring” card.
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