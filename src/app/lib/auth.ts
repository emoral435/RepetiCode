import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase-config";

import type { GoogleAuthProvider as GAuthType, GithubAuthProvider as GHAuthType } from "firebase/auth";

/* Our Google Authentication Helper Function */
async function GoogleAuthenticator() {
	const provider: GAuthType = new GoogleAuthProvider();
	await signInWithPopup(auth, provider);
}

/* Our Github Authentication Helper Function */
async function GithubAuthenticator() {
	const provider: GHAuthType = new GithubAuthProvider();
	await signInWithPopup(auth, provider);
}

export {
	GoogleAuthenticator,
	GithubAuthenticator,
}
