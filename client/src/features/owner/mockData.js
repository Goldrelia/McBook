// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

export const MOCK_SLOTS = [
  {
    id: 1,
    title: "Office Hours — COMP 307",
    type: "office_hours",
    status: "active",
    date: "Tuesday, April 1, 2026",
    time: "10:00 AM – 11:00 AM",
    location: "Trottier 3090",
    is_recurring: true,
    recurrence_weeks: 13,
    invite_token: "abc123xyz",
    bookings: [
      { id: 1, user: "Alice Martin", email: "alice.martin123@mail.mcgill.ca" },
      { id: 2, user: "Bob Nguyen",   email: "bob.nguyen123@mail.mcgill.ca" },
    ],
  },
  {
    id: 2,
    title: "TA Help Session",
    type: "office_hours",
    status: "private",
    date: "Friday, April 4, 2026",
    time: "1:00 PM – 2:00 PM",
    location: "Online (Zoom)",
    is_recurring: false,
    recurrence_weeks: null,
    invite_token: "def456uvw",
    bookings: [],
  },
  {
    id: 3,
    title: "Project Demo Scheduling",
    type: "group",
    status: "active",
    date: "Various",
    time: "Multiple slots",
    location: "TBD",
    is_recurring: false,
    recurrence_weeks: null,
    invite_token: "grp789abc",
    bookings: [],
    group_slots: [
      { id: 1, date: "Monday, April 7",   time: "2:00pm – 3:00pm",  votes: 3 },
      { id: 2, date: "Monday, April 7",   time: "5:00pm – 6:00pm",  votes: 1 },
      { id: 3, date: "Tuesday, April 8",  time: "9:00am – 10:00am", votes: 5 },
    ],
    finalized: false,
  },
];

export const MOCK_REQUESTS = [
  {
    id: 1,
    user: "Carol Lee",
    email: "carol.lee123@mail.mcgill.ca",
    message: "Hi Prof, I'd like to discuss my midterm feedback and talk about the project requirements.",
    status: "pending",
    created_at: "March 24, 2026",
  },
  {
    id: 2,
    user: "David Kim",
    email: "david.kim123@mail.mcgill.ca",
    message: "I'm having trouble with Assignment 3 and would love 15 minutes to go over it.",
    status: "pending",
    created_at: "March 25, 2026",
  },
  {
    id: 3,
    user: "Emma Tremblay",
    email: "emma.tremblay123@mail.mcgill.ca",
    message: "Could we meet to discuss potential research opportunities?",
    status: "accepted",
    created_at: "March 20, 2026",
  },
];