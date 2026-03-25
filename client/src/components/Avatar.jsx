// ── Avatar ─────────────────────────────────────────────────────────
// Props:
//   name — full name string, used to generate initials and color
//   size — number (default 32)

const AVATAR_COLORS = ["#e8192c", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function Avatar({ name, size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: avatarColor(name),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

export { avatarColor, initials };
