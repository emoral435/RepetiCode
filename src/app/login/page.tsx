import React from 'react'

const Login = () => {
  return (
    <div>
        <h1>Login</h1>
        <form>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
            <label htmlFor="password">First Name:</label>
            <input type="text" id="firstName" name="firstName" required />
            <button type="submit">Submit</button>
        </form>
    </div>
  )
}

export default Login