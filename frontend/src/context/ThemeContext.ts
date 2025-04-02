import { createContext, useContext } from "react";

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

export {
  useTheme,
  cssThemes,
  ThemeContext,
}
