import React from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, toggleTheme, className = "" }) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${isLight ? "theme-toggle-light" : "theme-toggle-dark"} ${className}`}
      title={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
      aria-label={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
    >
      <div className="theme-toggle-track">
        <div className={`theme-toggle-thumb ${isLight ? "thumb-light" : "thumb-dark"}`}>
          {isLight ? (
            <Sun className="theme-icon sun-icon" />
          ) : (
            <Moon className="theme-icon moon-icon" />
          )}
        </div>
      </div>
      <span className="theme-toggle-text">
        {isLight ? "Light" : "Dark"}
      </span>
    </button>
  );
}
