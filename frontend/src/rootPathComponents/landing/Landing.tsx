import { Link } from "react-router";
import { useTheme } from "../../context/ThemeContext";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
const Landing = () => {
  const { cssThemes } = useTheme();

  return (
    <div className="w-full h-full flex justify-center items-center">
      <section 
        style={{ background: cssThemes.colors.primary }}
        className="border-4 flex flex-col justify-around items-center text-inherit color w-3/4 md:w-1/2 text-center bg-inherit rounded-2xl shadow-lg p-8 gap-12"
      >
        <section
          style={{ background: cssThemes.colors.background }}
          className="max-w-full border-4 flex justify-center items-center gap-8 p-4 rounded-2xl shadow-2xl"
        >
          <div 
            className="transition-transform duration-700 hover:rotate-[360deg]"
          >
            <ArrowPathRoundedSquareIcon className="max-w-full w-30" />
          </div>
          <h1 className="text-xl lg:text-3xl xl:text-7xl font-extrabold drop-shadow-lg text-center">RepetiSwole</h1>
          <div className="transition-transform duration-700 hover:rotate-[360deg]">
            <ArrowPathRoundedSquareIcon  className="max-w-full w-30" />
          </div>
        </section>
        <section 
          style={{ background: cssThemes.colors.background }}
          className="border-4 flex flex-col justify-center items-center p-4 rounded-2xl shadow-2xl"
        >
          <p className="text-xl">Keep Hacking Away at Lifting</p>
          <p className="text-lg mt-1">Rep by Rep</p>
        </section>
        <section 
          style={{ background: cssThemes.colors.background }}
          className="border-4 flex flex-col md:flex-row justify-center items-center p-4 gap-4 rounded-2xl shadow-2xl"
        >
          <Link
            to="/login"
            className="border-4 px-6 py-3 rounded-2xl text-lg font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="border-4 px-6 py-3 rounded-2xl text-lg font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Register
          </Link>
        </section>

      </section>
    </div>
  );
};

export default Landing