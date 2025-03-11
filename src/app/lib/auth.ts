import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase-config";

import type { GoogleAuthProvider as GAuthType } from "firebase/auth";

async function GoogleAuthenticator() {
	const provider: GAuthType = new GoogleAuthProvider();
	// This will trigger a full page redirect away from your app
	console.log(`auth: ${auth}`);
	await signInWithPopup(auth, provider);
}

export {
	GoogleAuthenticator,
}
