import { Link, Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.ts";
import { SunIcon } from "@heroicons/react/24/outline";


const Layout = () => {
  const { cssThemes, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <div 
      style={{background: cssThemes.colors.background, color: cssThemes.colors.primaryTextColor, backgroundImage: `radial-gradient(${cssThemes.colors.primary} 1px, transparent 0)`, backgroundSize: "20px 20px"}}
      className="h-screen flex flex-col justify-between">
      <header className="flex w-full justify-between p-4">
        <Link to="/">RepetiSwole</Link>
        <button onClick={() => toggleTheme()}>
          <SunIcon width={30} />
        </button>
      </header>
      <main className="">
        <Outlet />
      </main>
      <footer className="flex w-full justify-center gap-4">
        <div>
          © Copyright {currentYear} ©
        </div>
        <a href="mailto:emoral435@gmail.com">
          Contact Me!
        </a>
      </footer>
    </div>
  )
};

export default Layout;
