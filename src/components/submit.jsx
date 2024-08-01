import React, { useState } from 'react';
import axios from 'axios';

const SubmitSecret = () => {
  const [secret, setSecret] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/submit', { secret }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Secret submitted:', response.data);
    } catch (error) {
      console.error('Error submitting secret:', error);
    }
  };

  return (
    <div className="register">
      <div className="reg">
        <div className="reg-in">
          <h1>YOUR BEST BUDDY</h1>
          <p style={{ textAlign: 'center' }}>care to share</p>
          <form onSubmit={handleSubmit}>
            <div className="form-signin">
              <textarea
                rows="4"
                cols="50"
                className="form-control submit-ta"
                name="secret"
                placeholder="What's your secret?"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="acc-btn">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitSecret;
