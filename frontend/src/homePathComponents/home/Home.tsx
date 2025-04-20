// import { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext"
// import { auth } from "../../lib/firebase";
// import { useNavigate } from "react-router";

const Home = () => {
  const { cssThemes } = useTheme();
  // const navigate = useNavigate();

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

  return (
    <div
      style={{ color: cssThemes.colors.primaryTextColor }}
      className="w-full h-full flex justify-center items-center"
    >
      <section
        style={{ background: cssThemes.colors.primary }}
        className="border-4 w-[90%] max-w-lg flex flex-col items-center rounded-2xl shadow-xl p-8 gap-8 text-center"
      >
        Home
      </section>
    </div>
  )
}

export default Home