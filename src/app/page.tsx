import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <div className="max-w-lg w-full text-center p-6">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">RepetiCode</h1>
        <p className="text-xl text-gray-300">Keep Hacking Away at Software Engineering</p>
        <p className="text-lg text-gray-400 mt-1">Bit By Bit</p>
        
        <div className="mt-6 flex justify-center space-x-4">
          <Link href="/signup" passHref>Sign Up</Link>
          <Link href="/login" passHref>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
