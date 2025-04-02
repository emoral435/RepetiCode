import { useState, useEffect } from "react";
import { ThemeContext, cssThemes } from "./ThemeContext";
import "./css-vars.css";


interface MyComponentProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: MyComponentProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

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