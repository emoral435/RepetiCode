import { Link } from "react-router";

const Landing = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <div className="max-w-lg w-full text-center p-8 bg-gray-800 rounded-2xl shadow-lg">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-4 drop-shadow-lg">RepetiCode</h1>
        <p className="text-xl text-gray-300">Keep Hacking Away at Software Engineering</p>
        <p className="text-lg text-gray-400 mt-1">Bit By Bit</p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-gray-700 rounded-full text-lg font-semibold text-white shadow-md hover:bg-gray-600 hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing