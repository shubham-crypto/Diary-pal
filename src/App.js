import React from 'react';
import { BrowserRouter , Route, Routes, Link } from 'react-router-dom';

import './styles.css';
import Footer from './partials/footer';
import Header from './partials/header';
import Home from './components/home';
import SignIn from './components/login';
import SignUp from './components/Signup';
import About from './components/about';
import ProtectedRoute from './ProtectedRoute';
import Account from './components/account';
import SubmitSecret from './components/submit';
import Compose from './components/compose';

const App = () => {
  return (
    <>
    <div className="app-container">
      <nav className="navbar ">
          <div className="navbar-container">
              <Header/>
              <ul className="nav navbar-nav">
                <li id="home"><Link to="/">HOME</Link></li>
                <li id="about"><Link to="/about">ABOUT US</Link></li>
                <li id="signup"><Link to="/Signup">SIGN UP</Link></li>
                <li id="login"><Link to="/login">LOG IN</Link></li>
              </ul>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/account" element={<ProtectedRoute Component={Account} />} />
          <Route path="/submit" element={<ProtectedRoute Component={SubmitSecret} />} />
          <Route path="/compose" element={<ProtectedRoute Component={Compose} />} />
        </Routes>
        </div>
        <Footer />
    </>
  );
};

export default App;
