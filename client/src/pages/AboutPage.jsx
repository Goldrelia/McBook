// Authors:
// Aurelia Bouliane - 261118164

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import Navbar from "../components/Navbar";
import Avatar from "../components/Avatar";
import Footer from "../components/Footer";

const TEAM = [
  {
    name: "Team Member One",
    role: "write",
    email: "member.one@mail.mcgill.ca",
    contributions: "TODO",
  },
  {
    name: "Team Member Two",
    role: "write",
    email: "member.two@mail.mcgill.ca",
    contributions: "TODO",
  },
  {
    name: "Team Member Three",
    role: "write",
    email: "member.three@mail.mcgill.ca",
    contributions: "TODO",
  },
  {
    name: "Team Member Four",
    role: "write",
    email: "member.four@mail.mcgill.ca",
    contributions: "TODO",
  },
];

// -- AboutPage
export default function AboutPage() {
}