// Authors:
// Aurelia Bouliane - 261118164

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Avatar from "../components/Avatar";
import Footer from "../components/Footer";
import PillBadge from "../components/PillBadge";
import { Calendar, Users, Mail, Bell } from "lucide-react";
import {
  SiGithub,
  SiReact, SiVite, SiNodedotjs, SiExpress, SiMysql,
} from "@icons-pack/react-simple-icons";

// TODO: replace with our actual repo URL
const REPO_URL = "https://github.com/your-org/your-repo";

// TODO: fill in role, contributions, github, and photo
// photo: import the image ex: import aurelia from "../assets/aurelia.jpg"
// then set photo: aurelia in the TEAM array
const TEAM = [
  {
    name: "Aurelia Bouliane",
    role: "write",
    email: "aurelia.bouliane@mail.mcgill.ca",
    github: "https://github.com/placeholder",
    contributions: "TODO",
    photo: null,
  },
  {
    name: "Hooman Azari",
    role: "write",
    email: "member.two@mail.mcgill.ca",
    github: "https://github.com/placeholder",
    contributions: "TODO",
    photo: null,
  },
  {
    name: "Team Member Three",
    role: "write",
    email: "member.three@mail.mcgill.ca",
    github: "https://github.com/placeholder",
    contributions: "TODO",
    photo: null,
  },
  {
    name: "Team Member Four",
    role: "write",
    email: "member.four@mail.mcgill.ca",
    github: "https://github.com/placeholder",
    contributions: "TODO",
    photo: null,
  },
];

const TECH_STACK = [
  { icon: <SiReact color="#61DAFB" size={18} />,       label: "React" },
  { icon: <SiVite color="#646CFF" size={18} />,        label: "Vite" },
  { icon: <SiNodedotjs color="#339933" size={18} />,   label: "Node.js" },
  { icon: <SiExpress color="var(--text)" size={18} />, label: "Express" },
  { icon: <SiMysql color="#4479A1" size={18} />,       label: "MySQL" },
];

// -- AboutPage
export default function AboutPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const token = localStorage.getItem("mcbook-token");
  const role = localStorage.getItem("mcbook-role");
  const homeRoute = token ? (role === "owner" ? "/owner/dashboard" : "/dashboard") : "/";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Navbar
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
        navLinks={[
          { label: token ? "Dashboard" : "Landing", onClick: () => navigate(homeRoute) },
          { label: "About Us", onClick: () => navigate("/about"), active: true },
        ]}
        actions={[
          token
            ? { label: "Back to Dashboard", variant: "ghost", onClick: () => navigate(homeRoute) }
            : { label: "Log in →", variant: "ghost", onClick: () => navigate("/login") },
        ]}
      />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px", textAlign: "center" }}>

        {/* Header */}
        <div className="mc-anim-0" style={{ marginBottom: 48 }}>
          <PillBadge>COMP 307 · McGill University · Winter 2026</PillBadge>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}>
            About McBook
          </h1>
          <p style={{ fontSize: 15.5, color: "var(--text2)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
            McBook is a booking application built for McGill University's School of Computer Science.
            It lets students schedule office hours with professors and TAs, coordinate group meetings,
            and send one-on-one meeting requests, all without the back-and-forth of email chains.
          </p>
        </div>

        {/* Our story + What we built */}
        <div className="mc-anim-1" style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 12 }}>
            Our story
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--text2)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 36px" }}>
            McBook was born out of a real frustration. Booking office hours at McGill meant endless email chains and missed replies. As a COMP 307 project, we set out to build something students and professors would actually want to use.
          </p>

          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 16 }}>
            What we built
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600, margin: "0 auto" }}>
            {[
              { icon: <Calendar size={18} />, title: "Office Hours",        desc: "Browse and reserve available slots from professors and TAs directly." },
              { icon: <Users size={18} />,    title: "Group Meetings",      desc: "Coordinate the best time with availability polling across participants." },
              { icon: <Mail size={18} />,     title: "Meeting Requests",    desc: "Send one-on-one requests that owners can accept or decline." },
              { icon: <Bell size={18} />,     title: "Email Notifications", desc: "All bookings trigger mailto notifications to keep everyone in the loop." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, textAlign: "left" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: "var(--red-light)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.8 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="mc-fade" style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 16 }}>
            Tech stack
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {TECH_STACK.map(tech => (
              <span key={tech.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 99, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>
                {tech.icon} {tech.label}
              </span>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mc-fade" style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 12 }}>
            The team
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--text2)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 36px" }}>
            So you know who to blame :)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
            {TEAM.map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </div>
        </div>

        {/* Get in touch */}
        <div className="mc-fade" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            Get in touch
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.6, marginBottom: 20 }}>
            Have a question, found a bug, or want to say hi? Check out our GitHub repository or reach out directly.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text2)", fontSize: 14, fontWeight: 600, textDecoration: "none", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,25,44,0.35)"; e.currentTarget.style.color = "var(--red)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
            >
              <SiGithub size={16} /> View on GitHub
            </a>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

// -- TeamCard
function TeamCard({ member }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hov ? "rgba(232,25,44,0.3)" : "var(--border)"}`,
        borderRadius: 10, padding: "18px",
        boxShadow: hov ? "0 0 0 3px rgba(232,25,44,0.07), var(--shadow-sm)" : "var(--shadow-sm)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        textAlign: "left",
      }}
    >
      {/* Avatar / photo */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        {member.photo ? (
          <img src={member.photo} alt={member.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <Avatar name={member.name} size={56} />
        )}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{member.name}</div>
          <div style={{ fontSize: 15, color: "var(--red)", fontWeight: 600 }}>{member.role}</div>
        </div>
      </div>

      {/* Contributions */}
      <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 14 }}>
        {member.contributions}
      </div>

      {/* Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <a
          href={`mailto:${member.email}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text2)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text2)"}
        >
          <Mail size={14} /> {member.email}
        </a>
        <a
          href={member.github}
          target="_blank"
          rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text2)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text2)"}
        >
          <SiGithub size={14} /> GitHub
        </a>
      </div>
    </div>
  );
}