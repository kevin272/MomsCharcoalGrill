import React from 'react'

const Footer = () => (
  <footer className="footer">
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
        <div className="footer-section">
          <h3>Location</h3>
          <address>2215 US Highway 1 South, North Brunswick, NJ 08902</address>
          <div className="map-placeholder">
            <img src="/Rectangle-2.png" alt="Location Map" />
          </div>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>P: 732.398.9022</p>
          <p>M: 917.518.4331</p>
          <p>M: 347.784.9269</p>
          <p>Fax: 732.658 3700</p>
          <p>Email: gurupalace@hotmail.com</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/menu">Menu</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/catering">Catering</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

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
