import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token') || document.cookie.split('=')[1];
      axios.get(`${API_URL}/account`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setUserDetails(response.data);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
      });
    }
  }, [user]);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <>
      <div className="register">
        <div className="reg">
          <h2>Congratulations</h2>
          {userDetails && (
            <>
              {userDetails.secret && <p className="secret-text">{userDetails.secret}</p>}
              {userDetails.reviews && Array.isArray(userDetails.reviews) && userDetails.reviews.length > 0 ? (
                <div className="review-list">
                  {userDetails.reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <h4>Title: {review.title}</h4>
                      <p>Content: {review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reviews available</p>
              )}
            </>
          )}
          <div className="reg-in">
            <form onSubmit={handleLogout}>
              <button className="acc-btn" type="submit">Log Out</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}  
export default Account;
