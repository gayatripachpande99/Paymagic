import React, { useEffect, useState } from "react";

export const AnimatedCounter = ({ value, duration = 1200, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // If value is non-numeric, just display it
    const numericTarget = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericTarget)) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp = null;
    const startVal = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (numericTarget - startVal) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = typeof displayValue === "number" ? displayValue.toLocaleString("en-IN") : displayValue;

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;

