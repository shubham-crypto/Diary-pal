import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext'; // Import the AuthContext if you're using it for authentication

//import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const SignIn = () => {
  // Local state to manage form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Get login function from context if using AuthContext
  const { login } = useContext(AuthContext);


  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      await login(email, password);
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  return (
    <div className="register">
      <div className="reg">
        <h1>Sign In</h1>
        <div className="reg-in">
          <form onSubmit={handleSubmit} className="form-signin">
            <input
              className="form-control"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoFocus
            />
            <input
              className="form-control"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button className="acc-btn" type="submit">
              Sign In
            </button>
          </form>
          <div className="reg-auth">
            <div className="reg-card">
              <a className="btn-auth" href="http://localhost:5000/auth/google" role="button">
                <img className="google-img" src={'google.png'} alt="Google" />
                Sign in with Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
