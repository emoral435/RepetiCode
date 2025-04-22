import { StarIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import { useTheme } from "../../context/ThemeContext";

const NotFound404 = () => {
  const { cssThemes } = useTheme();

  return (
    <div
      style={{ color: cssThemes.colors.primaryTextColor }}
      className="w-full h-screen flex justify-center items-center"
    >
      <section
        style={{ background: cssThemes.colors.primary }}
        className="border-4 w-[90%] max-w-xl flex flex-col items-center rounded-2xl shadow-xl p-8 gap-10 text-center"
      >
        <section
          style={{ background: cssThemes.colors.background }}
          className="border-4 flex justify-center items-center gap-4 p-4 rounded-2xl shadow-2xl"
        >
          <div className="inline-block transition-transform duration-700 hover:rotate-[360deg]">
            <StarIcon width={60} />
          </div>
          <h1 className="text-4xl font-extrabold drop-shadow-lg">404 - Page Not Found</h1>
          <div className="inline-block transition-transform duration-700 hover:rotate-[360deg]">
            <StarIcon width={60} />
          </div>
        </section>

        <div
          style={{ background: cssThemes.colors.background }}
          className="border-4 w-full flex flex-col items-center p-6 gap-6 rounded-2xl shadow-2xl"
        >
          <p className="text-lg font-medium">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-gray-300">
            Maybe you mistyped the URL, or the page has been taken to another galaxy.
          </p>
          <Link
            to="/"
            style={{ background: cssThemes.colors.secondary }}
            className="text-2xl w-full border-4 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Take Me Home
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotFound404;
