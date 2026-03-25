import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// -- Suggestions data
const ALL_SUGGESTIONS = [
  { label: "Joseph P Vybihal", sub: "Professor · 3 active slots",    type: "person", path: "/slots?owner=vybihal" },
  { label: "Derek Long",       sub: "Teaching Assistant · 2 slots",  type: "person", path: "/slots?owner=derek" },
  { label: "Sara Alami",       sub: "Teaching Assistant · 1 slot",   type: "person", path: "/slots?owner=sara" },
  { label: "Office Hours",     sub: "Browse all office hour slots",   type: "slot",   path: "/slots?type=office_hours" },
  { label: "Group Meetings",   sub: "Find group scheduling sessions", type: "slot",   path: "/slots?type=group" },
  { label: "Meeting Requests", sub: "Request a one-on-one meeting",   type: "slot",   path: "/slots?type=request" },
];

// -- Icons
const SearchIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const PersonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SunIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const LogoIcon = () => (
  <svg width="40" height="40" viewBox="0 0 42 42" fill="none">
    <circle cx="17" cy="17" r="10" stroke="#e8192c" strokeWidth="3.2"/>
    <line x1="24.5" y1="24.5" x2="34" y2="34" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
    <line x1="31" y1="37" x2="36" y2="32" stroke="#e8192c" strokeWidth="3.2" strokeLinecap="round"/>
  </svg>
);

// -- LandingPage
export default function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mcbook-theme") || "light");
  const [query, setQuery] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mcbook-theme", theme);
  }, [theme]);

  useEffect(() => {
    function handler(e) {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowDrop(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? ALL_SUGGESTIONS.filter(s =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.sub.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_SUGGESTIONS;

  function handleSelect(path) {
    setShowDrop(false);
    setQuery("");
    navigate(path);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/slots?q=${encodeURIComponent(query.trim())}`);
      setShowDrop(false);
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", minHeight: "100vh",
      background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 28px", flexShrink: 0,
      }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
          aria-label="Home"
        >
          <LogoIcon />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}
            title="Toggle theme"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "var(--text)", fontFamily: "inherit", letterSpacing: "-0.01em", padding: 0, transition: "color 0.15s" }}
            onMouseEnter={e => e.target.style.color = "var(--red)"}
            onMouseLeave={e => e.target.style.color = "var(--text)"}
          >
            Log in →
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 24px 120px",
      }}>
        <h1
          className="mc-anim-0"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.1rem)",
            fontWeight: 900, lineHeight: 1.08,
            letterSpacing: "-0.04em", color: "var(--text)",
            maxWidth: 680, marginBottom: 36,
          }}
        >
          Book time with your professors and TAs at McGill
        </h1>

        {/* Search bar */}
        <div
          className="mc-anim-1"
          style={{ width: "100%", maxWidth: 680, position: "relative" }}
        >
          <div style={{
            position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
            color: "var(--text3)", pointerEvents: "none", display: "flex", alignItems: "center",
          }}>
            <SearchIcon size={17} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Search by professor, department, or slot type"
            onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%", height: 52,
              padding: "0 20px 0 50px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, fontSize: 15.5, fontFamily: "inherit",
              color: "var(--text)", outline: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocusCapture={e => { e.target.style.borderColor = "var(--red)"; e.target.style.boxShadow = "0 0 0 3px var(--red-light), 0 1px 3px rgba(0,0,0,0.06)"; }}
            onBlurCapture={e =>  { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
          />

          {/* Dropdown */}
          {showDrop && filtered.length > 0 && (
            <div
              ref={dropRef}
              style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                overflow: "hidden", zIndex: 50,
              }}
            >
              {filtered.map((s, i) => (
                <SuggestionItem key={i} item={s} onSelect={() => handleSelect(s.path)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -- SuggestionItem
function SuggestionItem({ item, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={e => { e.preventDefault(); onSelect(); }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 18px", cursor: "pointer",
        background: hovered ? "var(--bg)" : "transparent",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.1s",
      }}
    >
      <div style={{
        width: 28, height: 28, background: "var(--red-light)", borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--red)", flexShrink: 0,
      }}>
        {item.type === "person" ? <PersonIcon /> : <CalIcon />}
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{item.label}</div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>{item.sub}</div>
      </div>
    </div>
  );
}
