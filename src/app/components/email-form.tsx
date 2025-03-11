'use client'

import React, { useState } from 'react';

export default function EmailForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<div className="bg-gray-800 text-white p-4 rounded-lg mt-4">
			<details>
				<summary className="cursor-pointer text-lg">Email & Password</summary>
				<form className="flex flex-col space-y-4 mt-2">
					<label className="block">
						<span className="text-gray-300">Email</span>
						<input 
							type="email" 
							className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" 
							required 
							value={email} 
							onChange={(e) => setEmail(e.target.value)} 
						/>
					</label>
					<label className="block">
						<span className="text-gray-300">Password</span>
						<input 
							type="password" 
							className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" 
							required 
							value={password} 
							onChange={(e) => setPassword(e.target.value)} 
						/>
					</label>
					<button 
						type="submit" 
						className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
					>
						Login
					</button>
				</form>
			</details>
		</div>
	);
}
