import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase"; // adjust path if needed
// import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // const navigate = useNavigate();

  const handleLogin = (provider: string) => {
    window.location.href = window.location.href.replace("/login", "") + "/auth/" + provider;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();

      console.log("Login success! Token:", token);
      // // 🔁 Send token to backend, or store as needed here
      // navigate("/dashboard"); // or wherever you want to redirect
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Failed to log in.");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">Login</h1>

        {/* Email/Password Login */}
        <form onSubmit={handleEmailLogin} className="mt-4 bg-gray-800 p-4 rounded-lg space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 rounded text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 rounded text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Log in with Email
          </button>
        </form>

        {/* Google Auth */}
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer text-lg">Login with Google</summary>
            <button
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              onClick={() => handleLogin("google")}
            >
              Log in with Google
            </button>
          </details>
        </div>

        {/* GitHub Auth */}
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer text-lg">Login with GitHub</summary>
            <button
              className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
              onClick={() => handleLogin("github")}
            >
              Log in with GitHub
            </button>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Login;