// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
import { useState } from "react";
import { X } from "lucide-react";
import Btn from "../../components/Btn";
import TimeDropdown from "../../components/TimeDropdown";
import { addGroupPollOptions, deleteGroupPollOption } from "../../services/api";

const ICON_SIZE = 13;
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Edit group poll time options before finalize.
 * Props: slot (with group_slots), onClose, onSaved — called after any change
 */
export default function EditGroupPollModal({ slot, onClose, onSaved }) {
  const [newRow, setNewRow] = useState({ day: "Monday", time_start: "", time_end: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // Store option ID to remove

  const options = slot.group_slots || [];

  async function handleAddChoice() {
    if (!newRow.time_start || !newRow.time_end) return;
    setBusy(true);
    setErr(null);
    try {
      await addGroupPollOptions(slot.id, {
        group_poll_weekly_slots: [
          { day: newRow.day, time_start: newRow.time_start, time_end: newRow.time_end },
        ],
      });
      setNewRow((s) => ({ ...s, time_start: "", time_end: "" }));
      onSaved?.();
    } catch (e) {
      setErr(e.message || "Failed to add option");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(optionId) {
    if (options.length <= 1) return;
    setConfirmRemove(optionId);
  }

  async function confirmAndRemove() {
    if (!confirmRemove) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteGroupPollOption(slot.id, confirmRemove);
      setConfirmRemove(null);
      onSaved?.();
    } catch (e) {
      setErr(e.message || "Failed to remove option");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mc-fade"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 28,
          width: "100%",
          maxWidth: 460,
          boxSizing: "border-box",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Edit poll times
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", padding: 4 }}
          >
            <X size={ICON_SIZE} />
          </button>
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 18 }}>{slot.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 12, lineHeight: 1.5 }}>
          Add or remove proposed times before you finalize. Each row is one vote choice (weekday + time), not every week in a range.
        </div>

        {err && (
          <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#b91c1c", fontSize: 13 }}>
            {err}
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Current options
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18, maxHeight: 200, overflowY: "auto" }}>
          {options.map((o) => (
            <div
              key={o.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <span>
                <strong>{o.date}</strong>
                <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                {o.time}
                <span style={{ color: "var(--text3)", marginLeft: 8 }}>({o.votes} votes)</span>
              </span>
              <button
                type="button"
                disabled={busy || options.length <= 1}
                onClick={() => handleRemove(o.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: options.length <= 1 ? "var(--text3)" : "var(--red)",
                  cursor: options.length <= 1 ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Add a choice
        </div>
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
            marginBottom: 12,
          }}
        >
          <select
            value={newRow.day}
            onChange={(e) => setNewRow((s) => ({ ...s, day: e.target.value }))}
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
          <TimeDropdown value={newRow.time_start} onChange={(v) => setNewRow((s) => ({ ...s, time_start: v }))} placeholder="Start" />
          <span style={{ color: "var(--text3)", fontSize: 13 }}>–</span>
          <TimeDropdown value={newRow.time_end} onChange={(v) => setNewRow((s) => ({ ...s, time_end: v }))} placeholder="End" />
          <Btn
            variant="red"
            onClick={handleAddChoice}
            disabled={busy || !newRow.time_start || !newRow.time_end}
            style={{ padding: "5px 12px", fontSize: 12, marginLeft: "auto" }}
          >
            Add to poll
          </Btn>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn variant="outline" onClick={onClose} disabled={busy}>
            Done
          </Btn>
        </div>
      </div>

      {/* Custom confirmation dialog */}
      {confirmRemove && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            className="mc-fade"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
              maxWidth: 380,
              boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              Remove this time option?
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>
              Votes for it will be cleared.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn
                variant="outline"
                onClick={() => setConfirmRemove(null)}
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </Btn>
              <Btn
                variant="red"
                onClick={confirmAndRemove}
                disabled={busy}
                style={{ padding: "8px 16px" }}
              >
                OK
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}