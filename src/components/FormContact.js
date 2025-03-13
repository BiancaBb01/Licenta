import React from "react";
import "../css/FormContact.css"; 

const FormContact = () => {
  return (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-form">
          <h3 className="green-title">GET IN TOUCH</h3>
          <h2>Suntem aici să răspundem la întrebările tale!</h2>
          <form>
            <label htmlFor="name">Nume *</label>
            <input type="text" id="name" name="name" placeholder="Numele tău" required />

            <label htmlFor="email">Adresă email *</label>
            <input type="email" id="email" name="email" placeholder="email@exemplu.com" required />

            <label htmlFor="phone">Număr de telefon *</label>
            <input type="tel" id="phone" name="phone" placeholder="07xx xxx xxx" required />

            <label htmlFor="message">Mesaj</label>
            <textarea id="message" name="message" placeholder="Scrie mesajul tău aici..."></textarea>

            <div className="checkbox-container">
              <input type="checkbox" id="consent" required />
              <label htmlFor="consent">
                Accept ca acest site să îmi stocheze informațiile pentru a răspunde solicitării mele.
              </label>
            </div>

            <button type="submit" className="submit-button">TRIMITE</button>
          </form>
        </div>

        <div className="contact-info">
          <h3>Contactează-ne</h3>
          <p><strong>Email:</strong> <a href="mailto:contact@greengarden.com">contact@greengarden.com</a></p>
          <p><strong>Locație:</strong> <a href="https://maps.google.com">Iași, IS, RO</a></p>

          <h3>Program</h3>
          <ul>
            <li><strong>Luni - Vineri:</strong> 09:00 - 22:00</li>
            <li><strong>Sâmbătă:</strong> 09:00 - 18:00</li>
          </ul>
           <div className="map-container">
            <iframe
              title="Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2719.6412183159816!2d27.574885315884273!3d47.1584542791566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40cafb8b0db0f9a5%3A0x1b9c2f648fc54f07!2sIa%C8%99i!5e0!3m2!1sen!2sro!4v1710238123456!5m2!1sen!2sro"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormContact;
