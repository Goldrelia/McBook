// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Calendar, Users, MessageSquare } from "lucide-react";
import Footer from "../components/Footer";

const FEATURES = [
  {
    icon: <Calendar size={20} />,
    title: "Office Hours",
    description: "Browse and reserve available office hour slots from professors and TAs — no more back-and-forth emails.",
  },
  {
    icon: <Users size={20} />,
    title: "Group Meetings",
    description: "Coordinate group sessions with availability polling. The best time gets selected and everyone is notified.",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Meeting Requests",
    description: "Send a one-on-one meeting request directly to a professor or TA. They accept or decline, and you're notified.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", minHeight: "100vh",
      background: "var(--bg)", color: "var(--text)",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <Navbar
        transparent
        theme={theme}
        onToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
        navLinks={[
          { label: "About Us", onClick: () => navigate("/about") },
        ]}
        actions={[
          { label: "Log in →", variant: "ghost", onClick: () => navigate("/login") },
        ]}
      />

      {/* Hero */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "60px 24px 40px",
      }}>

        {/* Eyebrow label */}
        <div
          className="mc-anim-0"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 14px", borderRadius: 99,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            fontSize: 12, fontWeight: 600,
            color: "var(--text3)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", display: "inline-block" }} />
          McGill University · SOCS
        </div>

        {/* Headline */}
        <h1
          className="mc-anim-1"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            fontWeight: 900, lineHeight: 1.08,
            letterSpacing: "-0.04em", color: "var(--text)",
            maxWidth: 680, marginBottom: 22,
          }}
        >
          Book time with your professors and TAs
        </h1>

        {/* Subheadline */}
        <p
          className="mc-anim-1"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "var(--text2)", lineHeight: 1.65,
            maxWidth: 480, marginBottom: 40,
            fontWeight: 400,
          }}
        >
          McBook makes it easy to schedule office hours, group meetings, and one-on-one sessions — all in one place.
        </p>

        {/* CTA */}
        <div className="mc-anim-1" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "12px 28px", borderRadius: 9, border: "none",
              background: "var(--red)", color: "#fff",
              fontSize: 14.5, fontWeight: 700, fontFamily: "inherit",
              cursor: "pointer", transition: "opacity 0.15s",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Get started →
          </button>
          <button
            onClick={() => navigate("/about")}
            style={{
              padding: "12px 28px", borderRadius: 9,
              border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text2)",
              fontSize: 14.5, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", transition: "border-color 0.15s, color 0.15s",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text3)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
          >
            Learn more
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        padding: "20px 24px 80px",
        width: "100%",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} delay={i * 0.07} />
          ))}
        </div>
      </div>
      
      < Footer />
    </div>
  );
}

function FeatureCard({ feature, delay }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      className="mc-fade"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        animationDelay: `${delay}s`,
        background: "var(--surface)",
        border: `1px solid ${hov ? "rgba(232,25,44,0.3)" : "var(--border)"}`,
        borderRadius: 12, padding: "24px 22px",
        boxShadow: hov ? "0 0 0 3px rgba(232,25,44,0.07), var(--shadow-sm)" : "var(--shadow-sm)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 9,
        background: "var(--red-light)", color: "var(--red)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}>
        {feature.icon}
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.01em" }}>
        {feature.title}
      </div>
      <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
        {feature.description}
      </div>
    </div>
  );
}