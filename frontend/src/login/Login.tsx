const Login = () => {
  const handleLogin = (provider: string) => {
    window.location.href = window.location.href.replace("/login", "") + "/auth/" + provider;
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">Login</h1>
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer text-lg">Login with Google</summary>
            <button className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onClick={() => handleLogin("google")}>Log in with Google</button>
          </details>
        </div>

        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer text-lg">Login with GitHub</summary>
            <button className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded" onClick={() => handleLogin("github")}>Log in with GitHub</button>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Login