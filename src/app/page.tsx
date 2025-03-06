import Link from 'next/link'

const LandingPage = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <main className="text-center">
        <h1 className="text-6xl text-blue-400">RepetiCode</h1>
        <p className="text-xl mt-2 text-gray-300">Keep Hacking Away at Software Engineering</p>
        <p className="text-lg mt-1 text-gray-400">Bit By Bit</p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link href={"/signup"} >Sign Up</Link>
          <Link href={"/login"} >Log In</Link>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
