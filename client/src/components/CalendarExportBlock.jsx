// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { Download } from "lucide-react";
import Btn from "./Btn";

/**
 * Quick actions: export to .ics (Google Calendar, Outlook, Apple Calendar).
 */
export default function CalendarExportBlock({
  onExport,
  bookedOnly = false,
  onBookedOnlyChange,
  showBookedOnlyOption = false,
  filterLabel = "Only slots with a confirmed booking",
}) {
  return (
    <div>
      {showBookedOnlyOption && onBookedOnlyChange && (
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 12.5,
            color: "var(--text2)",
            cursor: "pointer",
            marginBottom: 10,
            userSelect: "none",
            lineHeight: 1.35,
          }}
        >
          <input
            type="checkbox"
            checked={bookedOnly}
            onChange={(e) => onBookedOnlyChange(e.target.checked)}
            style={{ accentColor: "var(--red)", width: 15, height: 15, cursor: "pointer", marginTop: 2, flexShrink: 0 }}
          />
          <span>{filterLabel}</span>
        </label>
      )}
      <Btn variant="outline" onClick={onExport} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
        <Download size={14} /> Export to calendar
      </Btn>
      <p style={{ fontSize: 11.5, color: "var(--text3)", lineHeight: 1.45, margin: 0 }}>
        Downloads an .ics file. In Google Calendar use Settings → Import; in Outlook use File → Open → Calendar.
      </p>
    </div>
  );
}
