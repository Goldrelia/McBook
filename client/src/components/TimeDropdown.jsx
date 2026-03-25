import { useState, useEffect, useRef } from "react";

// -- Time options (15-min increments)
export function generateTimeOptions() {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const period = h < 12 ? "am" : "pm";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const mm = String(m).padStart(2, "0");
      times.push(`${h12}:${mm}${period}`);
    }
  }
  return times;
}

// -- TimeDropdown 
// Props:
//   value       — selected time string e.g. "9:00am"
//   onChange    — function(value)
//   placeholder — string shown when empty (default "Time")
export default function TimeDropdown({ value, onChange, placeholder = "Time" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);
  const times = generateTimeOptions();

  useEffect(() => {
    function handler(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && listRef.current && value) {
      const idx = times.indexOf(value);
      if (idx !== -1) {
        const item = listRef.current.children[idx];
        if (item) item.scrollIntoView({ block: "center" });
      }
    }
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "5px 12px",
          background: value ? "rgba(26,115,232,0.1)" : "var(--surface)",
          border: "1px solid " + (open ? "rgba(26,115,232,0.5)" : value ? "rgba(26,115,232,0.35)" : "var(--border)"),
          borderRadius: 6, fontSize: 13.5, fontFamily: "inherit",
          color: value ? "#1a73e8" : "var(--text3)",
          fontWeight: 500, cursor: "pointer", outline: "none",
          transition: "all 0.15s", whiteSpace: "nowrap",
          boxShadow: open ? "0 0 0 3px rgba(26,115,232,0.15)" : "none",
        }}
      >
        {value || placeholder}
      </button>

      {open && (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 9999,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            width: 150,
            maxHeight: 225,
            overflowY: "auto",
            padding: "4px 0",
          }}
        >
          {times.map(t => {
            const selected = t === value;
            return (
              <div
                key={t}
                onMouseDown={() => { onChange(t); setOpen(false); }}
                style={{
                  padding: "9px 16px",
                  fontSize: 13.5,
                  color: selected ? "#1a73e8" : "var(--text)",
                  background: selected ? "rgba(26,115,232,0.08)" : "transparent",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--surface2)"; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ width: 14, fontSize: 12, color: "#1a73e8" }}>
                  {selected ? "✓" : ""}
                </span>
                {t}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
