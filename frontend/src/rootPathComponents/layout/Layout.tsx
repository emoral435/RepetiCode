import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.ts";
import { SunIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuthContext } from "../../context/AuthContext.ts";
import { getAuth, signOut } from "firebase/auth";

const Layout = () => {
  const { cssThemes, toggleTheme } = useTheme();
  const [errMsg, setErrMsg] = useState<string>('');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const { user } = useAuthContext();
  const auth = getAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const userProtectedNavs = [
    { navName: "Profile", linkTo: "/home/profile" },
    { navName: "Workouts", linkTo: "/home/workouts" },
    { navName: "Metrics", linkTo: "/home/metrics" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      setErrMsg(`Error: ${err}`);
    }
  };

  return (
    <div
      style={{
        background: cssThemes.colors.background,
        color: cssThemes.colors.primaryTextColor,
        backgroundImage: `radial-gradient(${cssThemes.colors.primary} 1px, transparent 0)`,
        backgroundSize: "20px 20px"
      }}
      className="h-screen flex flex-col justify-between"
    >
      <header
        style={{ background: cssThemes.colors.primary }}
        className="p-4 border-4 rounded-2xl shadow-xl m-4"
      >
        <div className="flex justify-between items-center">
          <Link to="/" className="text-lg font-bold">RepetiSwole</Link>

          <div className="md:hidden">
            <button onClick={() => setMobileNavOpen(prev => !prev)}>
              {mobileNavOpen ? <XMarkIcon width={30} /> : <Bars3Icon width={30} />}
            </button>
          </div>

          <div className="hidden md:flex gap-6 items-center">
            {user && userProtectedNavs.map(n => (
              <Link key={n.linkTo} to={n.linkTo}>{n.navName}</Link>
            ))}
            {user && (
              <div className="flex flex-col items-center">
                <button onClick={handleSignOut}>Sign Out</button>
                {errMsg && <div className="text-red-500 text-sm">{errMsg}</div>}
              </div>
            )}
            <button onClick={toggleTheme}>
              <SunIcon width={30} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileNavOpen && (
          <div className="flex flex-col gap-4 mt-4 md:hidden">
            {user && userProtectedNavs.map(n => (
              <Link key={n.linkTo} to={n.linkTo} onClick={() => setMobileNavOpen(false)}>
                {n.navName}
              </Link>
            ))}
            {user && (
              <div className="flex flex-col items-start gap-2">
                <button onClick={async () => {
                  await handleSignOut();
                  setMobileNavOpen(false);
                }}>Sign Out</button>
                {errMsg && <div className="text-red-500 text-sm">{errMsg}</div>}
              </div>
            )}
            <button onClick={() => { toggleTheme(); setMobileNavOpen(false); }}>
              <SunIcon width={30} />
            </button>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="flex w-full justify-center gap-4">
        <div>© Copyright {currentYear} ©</div>
        <a href="mailto:emoral435@gmail.com">Contact Me!</a>
      </footer>
    </div>
  );
};

export default Layout;
