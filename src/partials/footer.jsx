import React, { useEffect } from 'react';
const Footer = () => {
  useEffect(() => {
    
    const accBtn = document.querySelector(".acc-btn");
    if (accBtn) {
      accBtn.style.backgroundColor = "";
    }
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <div>
      <div className="footer">
        <p>WISH YOU A HEALTHY ❤️ </p>
      </div>
    </div>
  );
};

export default Footer;
