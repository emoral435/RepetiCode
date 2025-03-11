'use client'

import React, { useEffect } from 'react'
import EmailForm from '../components/email-form';
import { AuthTypes, AuthProviderEmails } from '../definitions/auth';
import { loginWithGoogle, loginWithGithub } from '../lib/auth';
import { redirect } from "next/navigation";
import { auth } from '../lib/firebase-config';




const Login = () => {
  useEffect(() => {
    if (auth.currentUser) {
      redirect('/home'); // if user is logged in, redirect to home page immediately
    }
  }, []); // check at the beginning if the user is logged in or not

  async function login(a: AuthTypes) {
    let loggedInFlag = true;
    try {
      if (a === AuthTypes.EMAIL_PASSWORD) {
        // TODO check for email / password authentication
      } else if (a === AuthTypes.GOOGLE) {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }

      redirect('/home');
    } catch (error: any) {
      console.error('Error signing in with popup', error);
      // user has used this email before with a different provider - merge the two providers together to sync their data
      if (error.code.includes("auth/account-exists-with-different-credential")) {
          let provider = error.customerData.verifiedProvider[0]
          if (provider === AuthProviderEmails.GOOGLE) {}
        }
      } finally {
        if (loggedInFlag) {
          redirect('/home');
        }
      }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">Login</h1>
        <EmailForm />

        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer text-lg">Login with Google</summary>
            <button type="submit" className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onClick={async () => login(AuthTypes.GOOGLE)}>Log in with Google</button>
          </details>
        </div>

        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer text-lg">Login with GitHub</summary>
            <button className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded" onClick={async () => login(AuthTypes.GITHUB)}>Log in with GitHub</button>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Login