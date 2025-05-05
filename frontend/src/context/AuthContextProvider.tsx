import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";

interface AuthContextProps {
  children: React.ReactNode
}

const AuthContextProvider: React.FC<AuthContextProps> = ({children}) => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const {cssThemes} = useTheme();

  useEffect(() => {
    const unsubscribed = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      if (currentUser)
          setUser(currentUser);
      else
        setUser(null);
    })

    return () => {
      if (unsubscribed)
          unsubscribed();
    }
  }, [auth])

  const values = {
    user: user,
    setUser: setUser,
  }

  return (
    <AuthContext.Provider value={values}>
      {
        !loading && children
      }
      {
        loading && 
        <div 
          style={{
            backgroundColor: cssThemes.colors.background,
            backgroundImage: `radial-gradient(${cssThemes.colors.primary} 1px, transparent 0)`,
            backgroundSize: "20px 20px"
          }}
          className="w-screen h-screen flex justify-center items-center"
        >
          Loading...
        </div>
      }
    </AuthContext.Provider>
  )
}

export default AuthContextProvider;