import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "./firebase-config";

import type { GoogleAuthProvider as GAuthType, GithubAuthProvider as GHAuthType } from "firebase/auth";

async function loginWithGoogle() {
	let provider: GAuthType = new GoogleAuthProvider();
	await signInWithPopup(auth, provider);
}

async function loginWithGithub() {
	let provider: GHAuthType = new GithubAuthProvider();
	await signInWithPopup(auth, provider);
}

export {
	loginWithGoogle,
  loginWithGithub,
}
