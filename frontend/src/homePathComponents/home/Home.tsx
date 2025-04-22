// import { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext"
import { Outlet, useNavigate  } from "react-router";
import { signOut, getAuth } from "firebase/auth/web-extension";

const Home = () => {
  const { cssThemes } = useTheme();
  const auth = getAuth();
  const navigate = useNavigate();

  // useEffect(() => {
  //   auth.onAuthStateChanged(user => {
  //     // if the user is not logged in, redirect to login page
  //     if (!user) {
  //       navigate("/login");
  //     }
  //   })
  // }, [navigate])

  // const myAsync = async () => {
  //   try {
  //     await auth.currentUser?.getIdToken(true);
  //   } catch (error) {
  //     console.error(`error trying to get id token: ${error}`);
  //   }
  // }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
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
        <div>
          Home
        </div>
        <button onClick={async () => {
          await handleSignOut();
        }}>
          sign out
        </button>
        <Outlet />
      </section>
    </div>
  )
}

export default Home