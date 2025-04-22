import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

interface AuthContextProps {
  children: React.ReactNode
}

const AuthContextProvider: React.FC<AuthContextProps> = ({children}) => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        loading && <div>Loading...</div>
      }
    </AuthContext.Provider>
  )
}

export default AuthContextProvider;