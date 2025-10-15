import React from 'react'

const Footer = () => (
  <footer className="footer dark-theme">
    <div className="container">
      <div className="footer-logo">
        {/* Yellow rails */}
        <div className="footer-rails" aria-hidden="true">
          <img src="/Rectangle 139.svg" alt="" className="rail left" />
          <img src="/Rectangle 139.svg" alt="" className="rail right" />
        </div>

        {/* Center logo */}
        <img src="/apples-2.png" alt="Mom's Charcoal and Grill" />
      </div>

      <div className="footer-content">
        {/* Location */}
        <div className="footer-section">
          <h3>Location</h3>
          <address>2215 US Highway 1 South, North Brunswick, NJ 08902</address>
          <div className="footer-map dark-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3036.262016535726!2d-74.49835259999999!3d40.4473374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c3c4759962760d%3A0x19da9a1a347f34be!2s2215%20U.S.%20Rte%201%2C%20North%20Brunswick%20Township%2C%20NJ%2008902%2C%20USA!5e0!3m2!1sen!2snp!4v1760543165853!5m2!1sen!2snp"
              width="100%"
              height="250"
              style={{
                border: 0,
                filter: 'invert(90%) hue-rotate(180deg) contrast(90%) brightness(90%)',
                borderRadius: '8px'
              }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mom's Charcoal & Grill Location"
            ></iframe>
          </div>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>P: 732.398.9022</p>
          <p>M: 917.518.4331</p>
          <p>M: 347.784.9269</p>
          <p>Fax: 732.658 3700</p>
          <p>Email: gurupalace@hotmail.com</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/menu">Menu</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/catering">Catering</a></li>
          </ul>
        </div>

        {/* Hours */}
        <div className="footer-section">
          <h3>Hours of Operation</h3>
          <p className="days-open">6 DAYS OPEN</p>
          <p>Monday, Wednesday-Friday: 11AM To 3PM</p>
          <p>Saturday-Sunday: 10AM To 9:30PM</p>
          <p>Tuesday: Closed</p>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
