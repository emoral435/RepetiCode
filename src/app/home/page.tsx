'use client'

import { useEffect } from "react"
import { auth } from "../lib/firebase-config";
import { redirect } from "next/navigation";

const Home = () => {
	useEffect(() => {
		if (!auth.currentUser) {
      redirect('/login'); // if user is not logged in, redirect to login page immediately
    }

		console.log(`User: ${auth.currentUser}`)
	}, []); // only check if the user is logged in once
	return (
		<div>
			Home
		</div>
	)
}

export default Home