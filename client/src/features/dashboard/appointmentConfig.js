// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

export const TYPE_CONFIG = {
  office_hours: { label: "Office Hours",    color: "var(--red)", bg: "rgba(232,25,44,0.09)" },
  group:        { label: "Group Meeting",   color: "#3b82f6",    bg: "rgba(59,130,246,0.09)" },
  request:      { label: "Meeting Request", color: "#10b981",    bg: "rgba(16,185,129,0.09)" },
};

export const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "#10b981", bg: "rgba(16,185,129,0.09)" },
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.09)" },
  need_vote: { label: "Needs your vote", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  awaiting_owner: { label: "Awaiting owner", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
};