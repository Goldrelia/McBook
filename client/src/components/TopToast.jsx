// Hooman Azari - 261055604
import { useEffect, useState } from "react";

export default function TopToast({ message, type = "info", onClose, duration = 3200 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }

    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, Math.max(900, duration));

    const closeTimer = setTimeout(() => {
      onClose?.();
    }, Math.max(900, duration) + 220);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const accent =
    type === "error"
      ? "var(--red)"
      : type === "success"
        ? "#10b981"
        : "#3b82f6";

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-10px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 220ms ease, transform 260ms ease",
        zIndex: 1200,
        maxWidth: "min(92vw, 620px)",
        width: "fit-content",
        padding: "10px 14px",
        borderRadius: 12,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `4px solid ${accent}`,
        color: "var(--text)",
        boxShadow: "var(--shadow-sm)",
        fontSize: 13,
        lineHeight: 1.4,
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}
