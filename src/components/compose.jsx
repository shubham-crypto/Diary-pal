import React, { useState } from 'react';
import axios from 'axios';

const Compose = () => {
  const [name, setName] = useState('');
  const [postBody, setPostBody] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/compose`, { name, postBody }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Post published:', response.data);
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  return (
    <div className="register">
      <div className="reg">
        <h1 style={{ color: '#1abc9c' }}>Compose</h1>
        <div className="reg-in">
          <form onSubmit={handleSubmit}>
            <div className="compose-form">
              <label><h3>Name</h3></label>
              <input
                className="form-control compose-name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label><h3>Post</h3></label>
              <textarea
                className="form-control"
                name="postBody"
                rows="4"
                cols="50"
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="acc-btn" name="button">Publish</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Compose;
