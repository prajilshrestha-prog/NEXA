import { createContext, useContext, useState, useEffect } from "react";

export type Theme =
  | "elegant-dark"
  | "cyberpunk"
  | "horror"
  | "corporate"
  | "music";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("elegant-dark");

  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-elegant-dark",
      "theme-cyberpunk",
      "theme-horror",
      "theme-corporate",
      "theme-music",
    );
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
