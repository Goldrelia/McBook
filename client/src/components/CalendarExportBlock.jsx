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
  filterLabel = "Export only confirmed/booked items",
}) {
  return (
    <div>
      <Btn variant="outline" onClick={onExport} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
        <Download size={14} /> Export to calendar
      </Btn>
      {showBookedOnlyOption && onBookedOnlyChange && (
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 12.5,
            color: "var(--text2)",
            cursor: "pointer",
            userSelect: "none",
            lineHeight: 1.35,
          }}
        >
          <input
            type="checkbox"
            checked={bookedOnly}
            onChange={(e) => onBookedOnlyChange(e.target.checked)}
            className="mc-checkbox"
            style={{ marginTop: 2 }}
          />
          <span>
            <strong style={{ color: "var(--text)" }}>Export filter:</strong> {filterLabel}
          </span>
        </label>
      )}
    </div>
  );
}
