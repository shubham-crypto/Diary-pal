import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create a Context for Authentication
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // To manage loading state
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || document.cookie.split('=')[1];

    if (token) {
      axios.get('http://localhost:5000/diary', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          setUser(response.data);
          setIsLoggedIn(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      setIsLoggedIn(true);
      navigate('/account');
      console.log(userData)
    } catch (error) {
      alert(error.response.data.message)
    }
  };

  const signup = async (email, password, role) => {
    try {
      await axios.post('http://localhost:5000/signup', { email, password, role });
      await login(email, password);
    } catch (error) {
      console.error('Error signing up', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
