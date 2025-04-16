// login.tsx
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const loginUser = async (email: string, password: string) => {
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    console.log(user);
  } catch (err) {
    console.error("Login error:", err);
  }
};

export {
  loginUser,
}