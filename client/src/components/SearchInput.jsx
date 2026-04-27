// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { Search } from "lucide-react";

// -- SearchInput
// Props:
//   value       — current search string
//   onChange    — function(value)
//   placeholder — string (optional)
//   style       — additional styles for the wrapper (optional)
export default function SearchInput({ value, onChange, placeholder = "Search…", style = {} }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <div style={{
        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        color: "var(--text3)", pointerEvents: "none", display: "flex",
      }}>
        <Search size={14} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mc-input"
        style={{ paddingLeft: 34, height: 36, fontSize: 13 }}
      />
    </div>
  );
}