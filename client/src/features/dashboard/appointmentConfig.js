// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
// TODO: DELETE WHEN BACKEND FULLY IMPLEMENTED

export const MOCK_APPOINTMENTS = [
  {
    id: 1,
    title: "Office Hours — Prof. Vybihal",
    type: "office_hours",
    date: "Tuesday, April 1, 2026",
    time: "10:00 AM – 11:00 AM",
    location: "Trottier 3090",
    owner: "Joseph P Vybihal",
    ownerEmail: "joseph.vybihal123@mcgill.ca",
    status: "confirmed",
  },
  {
    id: 2,
    title: "TA Office Hours — Assignment 3",
    type: "office_hours",
    date: "Friday, April 4, 2026",
    time: "1:00 PM – 2:00 PM",
    location: "Online (Zoom)",
    owner: "Derek Long",
    ownerEmail: "derek.long123@mail.mcgill.ca",
    status: "confirmed",
  },
  {
    id: 3,
    title: "Project Demo Coordination",
    type: "group",
    date: "Wednesday, April 9, 2026",
    time: "3:00 PM – 4:00 PM",
    location: "McConnell 103",
    owner: "Joseph P Vybihal",
    ownerEmail: "joseph.vybihal123@mcgill.ca",
    status: "confirmed",
  },
  {
    id: 4,
    title: "One-on-One Meeting Request",
    type: "request",
    date: "Pending approval",
    time: "TBD",
    location: "TBD",
    owner: "Joseph P Vybihal",
    ownerEmail: "joseph.vybihal123@mcgill.ca",
    status: "pending",
  },
];

export const TYPE_CONFIG = {
  office_hours: { label: "Office Hours",    color: "var(--red)", bg: "rgba(232,25,44,0.09)" },
  group:        { label: "Group Meeting",   color: "#3b82f6",    bg: "rgba(59,130,246,0.09)" },
  request:      { label: "Meeting Request", color: "#10b981",    bg: "rgba(16,185,129,0.09)" },
};

export const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "#10b981", bg: "rgba(16,185,129,0.09)" },
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.09)" },
};