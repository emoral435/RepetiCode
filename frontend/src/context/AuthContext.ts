import { createContext, useContext } from "react";
import { User } from "firebase/auth";

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
})

const useAuthContext = () => {
  return useContext(AuthContext);
}

export {
  useAuthContext,
  AuthContext,
}