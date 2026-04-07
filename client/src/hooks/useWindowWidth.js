// Authors:
// Aurelia Bouliane - 261118164

import { useState, useEffect } from "react";

// -- useWindowWidth
// Returns the current window width, updates on resize.
// Use to conditionally render mobile vs desktop layouts.
export default function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}