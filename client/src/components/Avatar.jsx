// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

// ── Avatar ─────────────────────────────────────────────────────────
// Props:
//   name — full name string, used to generate initials and color
//   email — fallback if name is not provided
//   size — number (default 32)

const AVATAR_COLORS = ["#e8192c", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

function avatarColor(name) {
  // Convert everything to string first
  const str = String(name || '');
  
  // Empty string check
  if (str.length === 0) {
    return AVATAR_COLORS[0];
  }
  
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  // Safety check for undefined/null/empty
  if (!name || typeof name !== 'string') {
    return '?';
  }
  
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || '?';
}

export default function Avatar({ name, email, size = 32 }) {
  // Use email as fallback if name is missing
  const displayName = name || email?.split('@')[0] || 'User';
  
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: avatarColor(displayName),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      flexShrink: 0,
    }}>
      {initials(displayName)}
    </div>
  );
}

export { avatarColor, initials };