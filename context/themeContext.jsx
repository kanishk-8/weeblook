"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Create the ThemeContext
const ThemeContext = createContext();

// Custom hook for easy access
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider component to wrap around the app
export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or use default
  const [theme, setTheme] = useState("light");

  // Load theme from localStorage on component mount only
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      localStorage.setItem("theme", theme);
    }

    // Add event listener for system theme changes
    const handleSystemThemeChange = (e) => {
      const newColorScheme = e.matches ? "dark" : "light";
      setTheme(newColorScheme);
    };

    // Check if browser supports matchMedia
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      // Initial check
      if (!localStorage.getItem("theme")) {
        setTheme(mediaQuery.matches ? "dark" : "light");
      }
      // Add listener for changes
      mediaQuery.addEventListener("change", handleSystemThemeChange);

      // Cleanup
      return () =>
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = { theme, setTheme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
