'use client'

import React, { useEffect } from 'react'
import EmailForm from '../components/email-form';
import { GoogleAuthenticator } from '../lib/auth';
import { redirect } from "next/navigation";
import { auth } from '../lib/firebase-config';

const Login = () => {
  useEffect(() => {
    if (auth.currentUser) {
      redirect('/home'); // if user is logged in, redirect to home page immediately
    }
  }, []); // check at the beginning if the user is logged in or not

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">Login</h1>
        <EmailForm />

        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer text-lg">Login with Google</summary>
            <button type="submit" className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onClick={async () => {
              await GoogleAuthenticator();
              redirect('/home');
            }}>Log in with Google</button>
          </details>
        </div>

        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer text-lg">Login with GitHub</summary>
            <button className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">Log in with GitHub</button>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Login