import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { StarIcon } from "@heroicons/react/24/outline";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth/web-extension";
import { Link, useNavigate } from "react-router";

const Login = () => {
  const { cssThemes } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [registeredMsg, setRegisteredMsg] = useState<string>("");
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setRegisteredMsg(sessionStorage.getItem("registered") ?? '');
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message || "Failed to log in.");
      }
    }
  };

  return (
    <div
      style={{ color: cssThemes.colors.primaryTextColor }}
      className="w-full h-full flex justify-center items-center"
    >
      <section
        style={{ background: cssThemes.colors.primary }}
        className="border-4 w-[90%] max-w-lg flex flex-col items-center rounded-2xl shadow-xl p-8 gap-8 text-center"
      >
        <section
          style={{ background: cssThemes.colors.background }}
          className="border-4 flex justify-center items-center gap-4 p-4 rounded-2xl shadow-2xl"
        >
          <div className="inline-block transition-transform duration-700 hover:rotate-[360deg]">
            <StarIcon width={60} />
          </div>
          <h1 className="text-4xl font-extrabold drop-shadow-lg">Log In</h1>
          <div className="inline-block transition-transform duration-700 hover:rotate-[360deg]">
            <StarIcon width={60} />
          </div>
        </section>

        <form
          onSubmit={handleEmailLogin}
          style={{ background: cssThemes.colors.background }}
          className="border-4 w-full flex flex-col items-center p-6 gap-4 rounded-2xl shadow-2xl"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 rounded-2xl border border-black-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 rounded-2xl border border-black-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {registeredMsg && <p className="text-green-400 text-sm">{registeredMsg}</p>}
          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
          <button
            type="submit"
            style={{ background: cssThemes.colors.secondary }}
            className="text-2xl w-full border-4 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Log In with Email
          </button>
        </form>
        <section 
          style={{ background: cssThemes.colors.background }}
          className="border-4 w-full flex flex-col items-center p-6 gap-4 rounded-2xl shadow-2xl"
        >
          <h2>Not Registered Yet?</h2>
          <Link to={"/register"} 
            style={{ background: cssThemes.colors.secondary }}
            className="text-2xl w-full border-4 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Register Now. It's free!
          </Link>
        </section>
      </section>
    </div>
  );
};

export default Login;
