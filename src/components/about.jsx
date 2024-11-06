import axios from 'axios';
import React, { useEffect, useState } from 'react';

const About = () => {
  const [startingc, setStartingc] = useState(''); // Initialize state to store the fetched data
  const API_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make an Axios request to your backend
        const response = await axios.get(`${API_URL}/about`); // Adjust the URL as needed
        setStartingc(response.data); // Update state with the fetched data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data when the component mounts
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <div className="reg">
      <h1>About</h1>
      <p>{startingc}</p>
    </div>
  );
};

export default About;

