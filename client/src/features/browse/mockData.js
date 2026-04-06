// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261118164
export const MOCK_OWNERS = [
  {
    id: 1,
    name: "Joseph P Vybihal",
    email: "joseph.vybihal123@mcgill.ca",
    role: "Professor",
    department: "COMP",
    slots: [
      { id: 101, day: "Monday",    time: "10:00am – 11:00am", location: "Trottier 3090",  weeks: 13, booked: false },
      { id: 102, day: "Wednesday", time: "10:00am – 11:00am", location: "Trottier 3090",  weeks: 13, booked: false },
      { id: 103, day: "Tuesday",   time: "2:00pm – 3:00pm",   location: "Online (Zoom)",  weeks: 13, booked: true  },
    ],
  },
  {
    id: 2,
    name: "Derek Long",
    email: "derek.long123@mail.mcgill.ca",
    role: "Teaching Assistant",
    department: "COMP",
    slots: [
      { id: 201, day: "Friday",  time: "1:00pm – 2:00pm", location: "Online (Zoom)",   weeks: 8, booked: false },
      { id: 202, day: "Tuesday", time: "3:00pm – 4:00pm", location: "Trottier 3120",   weeks: 8, booked: false },
    ],
  },
  {
    id: 3,
    name: "Sara Alami",
    email: "sara.alami123@mail.mcgill.ca",
    role: "Teaching Assistant",
    department: "COMP",
    slots: [
      { id: 301, day: "Thursday", time: "11:00am – 12:00pm", location: "McConnell 320", weeks: 10, booked: false },
    ],
  },
];