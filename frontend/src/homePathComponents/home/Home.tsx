import { getAuth } from "firebase/auth";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router";
import { SparklesIcon, CogIcon, HomeIcon } from "@heroicons/react/24/solid";

const Home = () => {
  const { cssThemes } = useTheme();
  const user = getAuth().currentUser;

  const routes = [
    {
      link: "/home/profile",
      display: "Check out your profile settings",
      icon: <CogIcon className="w-6 h-6 text-indigo-600" />,
    },
    {
      link: "/home/workouts",
      display: "Make new workout routines",
      icon: <SparklesIcon className="w-6 h-6 text-green-600" />,
    },
  ];

  return (
    <div
      className="w-full h-full flex justify-center items-center transition-colors duration-500"
      style={{ color: cssThemes.colors.primaryTextColor }}
    >
      <section
        style={{ background: cssThemes.colors.primary }}
        className="border-4 w-[90%] max-w-lg flex flex-col items-center rounded-2xl shadow-xl p-8 gap-8 text-center transition-all duration-500"
      >
        <section
          style={{ background: cssThemes.colors.background }}
          className="border-4 flex justify-center items-center gap-4 p-4 rounded-2xl shadow-2x animate-fadeIn"
        >
          <HomeIcon className="w-8 h-8 text-purple-500 transition-transform duration-700 hover:rotate-[360deg]" />
          <h1 className="text-2xl font-bold">
            Home
          </h1>
          <HomeIcon className="w-8 h-8 text-purple-500 transition-transform duration-700 hover:rotate-[360deg]" />
        </section>
        <section
          style={{ background: cssThemes.colors.background }}
          className="border-4 flex justify-center items-center gap-4 p-4 rounded-2xl shadow-2x animate-fadeIn"
        >
          <SparklesIcon className="w-8 h-8 text-yellow-500 animate-bounce" />
          <h2 className="text-xl font-bold">
            Welcome, {user?.displayName || "Champion"}!
          </h2>
          <SparklesIcon className="w-8 h-8 text-yellow-500 animate-bounce" />
        </section>

        {routes.map((route) => (
          <section
            style={{ background: cssThemes.colors.background }}
            key={route.link}
            className="border-4 flex items-center gap-4 p-4 rounded-2xl shadow-2x w-full justify-start cursor-pointer transition duration-300 ease-in-out"
          >
            {route.icon}
            <Link to={route.link} className="text-lg font-medium hover:underline">
              {route.display}
            </Link>
          </section>
        ))}
      </section>
    </div>
  );
};

export default Home;
