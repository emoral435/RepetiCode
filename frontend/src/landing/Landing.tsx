import { Link } from "react-router";
import { useTheme } from "../context/ThemeContext.ts";

const Landing = () => {
  const {cssThemes, toggleTheme} = useTheme();

  return (
    <div style={{background: cssThemes.colors.background, color: cssThemes.colors.primaryTextColor}} 
      className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="text-inherit color max-w-lg w-full text-center bg-inherit rounded-2xl shadow-lg">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">RepetiSwole</h1>
        <p className="text-xl">Keep Hacking Away at Lifting</p>
        <p className="text-lg mt-1">Rep by Rep</p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Log In
          </Link>
          <button onClick={() => toggleTheme()}>Click me</button>
        </div>
      </div>
    </div>
  );
};

export default Landing