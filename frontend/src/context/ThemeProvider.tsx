import { useState, createContext, useContext, useEffect } from "react";
import "./css-vars.css";

interface MyComponentProps {
  children: React.ReactNode;
}

interface cssThemesProps {
  colors: {
    primary: string,
    background: string,
    primaryTextColor: string,
  }
}

// these props are defined in the css file bundled in this same directory
const cssThemes: cssThemesProps = {
  colors: {
    primary: 'var(--colors-primary)',
    background: 'var(--colors-background)',
    primaryTextColor: 'var(--text-color-primary)',
  }
}

const ThemeContext = createContext({
  cssThemes,
  toggleTheme: () => {},
});

const useTheme = () => {
  return useContext(ThemeContext);
};

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

export {
  useTheme,
  ThemeProvider
}