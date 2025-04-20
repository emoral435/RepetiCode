import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { ViewfinderCircleIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";

const Register = () => {
  const { cssThemes } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [displayname, setDisplayname] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const origin = window.location.origin;
      const res = await fetch(origin + "/api/v1/register/email", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password, displayname: displayname }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json();
      // if there was an error message within the JSON response
      if (Object.prototype.hasOwnProperty.call(data, "error")) {
        throw Error(`response returned error: ${data.error}`);
      }

      // load within the session that the user just registered
      sessionStorage.setItem("registered", "Successfully registered account! Welcome.");
      // if we get here, we can navigate the user to navigate to Log In
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
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
          <div className="transition-transform duration-700 hover:rotate-[360deg]">
            <ViewfinderCircleIcon width={60} />
          </div>
          <h1 className="text-4xl font-extrabold drop-shadow-lg">Register Account</h1>
          <div className="transition-transform duration-700 hover:rotate-[360deg]">
            <ViewfinderCircleIcon width={60} />
          </div>
        </section>

        <form
          onSubmit={handleRegister}
          style={{ background: cssThemes.colors.background }}
          className="border-4 w-full flex flex-col items-center p-6 gap-4 rounded-2xl shadow-2xl"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 rounded border border-black-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Displayname"
            className="w-full px-3 py-2 rounded border border-black-300"
            value={displayname}
            onChange={(e) => setDisplayname(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 rounded border border-black-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-3 py-2 rounded border border-black-300"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
          <button
            type="submit"
            style={{ background: cssThemes.colors.secondary }}
            className="text-2xl w-full border-4 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Register
          </button>
        </form>
        <section 
          style={{ background: cssThemes.colors.background }}
          className="border-4 w-full flex flex-col items-center p-6 gap-4 rounded-2xl shadow-2xl"
        >
          <h2>Already Registered?</h2>
          <Link to={"/login"} 
            style={{ background: cssThemes.colors.secondary }}
            className="text-2xl w-full border-4 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
          >
            Log In!
          </Link>
        </section>
      </section>
    </div>
  );
};

export default Register;
