import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="register">
      <div className="reg">
        <h1>HOME</h1>
        <div className="home">
          <div className="home-con">
            <Link className="home-a" to="/submit">
              <img className="home-img" src={'/note.avif'} alt="How was your day" />
              How was your Day
            </Link>
          </div>
          <div className="home-con">
            <Link className="home-a" to="/compose">
              <img className="home-img" src={'/rev.png'} alt="Write a review" />
              Write a review
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
