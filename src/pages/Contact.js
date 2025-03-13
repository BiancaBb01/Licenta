import React from "react";
import "../css/Contact.css"; 
import backgroundImage from "../images/fundal.jpg"; 
import FormContact from "../components/FormContact"; 

const Contact = () => {
  return (
    <div>
      <div className="parallax-section">
        <img src={backgroundImage} alt="Contact Green Garden" className="parallax-image" />
        <div className="parallax-overlay"></div>
        <div className="parallax-content">
          <h1>Contactează-ne</h1>
          <p>Ai întrebări? Suntem aici să te ajutăm!</p>
        </div>
      </div>

      <FormContact />
    </div>
  );
};

export default Contact;
