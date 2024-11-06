import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/Signup`, {
        email: formData.email,
        password: formData.password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/login');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="register">
      <div className="reg">
        <h1>Sign Up</h1>
        <div className="reg-in">
          {error && <div className="error">{error}</div>}
          <form className="form-signin" onSubmit={handleSubmit}>
            <input
              className="form-control"
              type="text"
              name="email"
              placeholder="Email address"
              required
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <input
              className="form-control"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              className="acc-btn reg-btn"
              name="account"
              value="Register"
              type="submit"
            >
              Register
            </button>
          </form>
          <div className="reg-auth">
            <div className="reg-card">
              <a className="btn-auth" href={`${API_URL}/auth/google`} role="button">
                <img className="google-img" src={'google.png'} alt="Google" />
                Sign Up with Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
