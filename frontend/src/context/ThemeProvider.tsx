import { useState, useEffect } from "react";
import { ThemeContext, cssThemes } from "./ThemeContext";
import "./css-vars.css";


interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme((mode) => mode == 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ cssThemes, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
};

export default ThemeProvider