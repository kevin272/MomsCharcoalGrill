import React, { useState } from 'react'

const Footer = () => {
  const [hoveredfb, setHoveredfb] = useState(false);
    const [hoveredig, setHoveredig] = useState(false);

 return (

  <footer className="footer dark-theme">
    <div className="container">
      <div className="footer-logo">
        {/* Yellow rails */}
        <div className="footer-rails" aria-hidden="true">
          <img src="/Rectangle 139.svg" alt="" className="rail left" />
          <img src="/Rectangle 139.svg" alt="" className="rail right" />
        </div>

        {/* Center logo */}
        <img src="/Group 16.png" alt="Mom's Charcoal and Grill" />
      </div>

      <div className="footer-content">
        {/* Location */}
        <div className="footer-section">
          <h3>Location</h3>
          <address>Pialba Place Shopping Centre, Old Maryborough Rd, Pialba QLD 4655</address>
          <div className="footer-map dark-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.6109836456867!2d152.8405061!3d-25.283668599999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6bec80304b5fb249%3A0xbe3bd27750bf44b4!2sMum&#39;s%20Charcoal%20%26%20Grill!5e0!3m2!1sen!2snp!4v1767103648547!5m2!1sen!2snp"
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
<p>
  <a href="tel:+61741942975">(+61) 7 4194 2975</a>
</p>

  <p>Email: <a href="mailto:mumscharcoalandgrill@gmail.com">mumscharcoalandgrill@gmail.com</a></p>
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",             
    marginTop: "6px",      
  }}
>
  <a
  href="https://www.facebook.com/mumscharcoalandgrill/"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: 'flex',
    alignItems: 'center',
    color: hoveredfb ? 'gold' : 'inherit',
    transition: 'color 0.2s ease',
  }}
  onMouseEnter={() => setHoveredfb(true)}
  onMouseLeave={() => setHoveredfb(false)}
>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-facebook"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  </a>

  <a
    href="https://www.instagram.com/mumscharcoalandgrill/"
    target="_blank"
    rel="noopener noreferrer"
    style={{
    display: 'flex',
    alignItems: 'center',
    color: hoveredig ? 'gold' : 'inherit',
    transition: 'color 0.2s ease',
  }}
  onMouseEnter={() => setHoveredig(true)}
  onMouseLeave={() => setHoveredig(false)}
>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-instagram"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  </a>
</div>

</div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/menu">Menu</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/catering">Catering</a></li>
          </ul>
        </div>

        {/* Hours */}
        <div className="footer-section">
  <h3>Operating Hours</h3>
  <p>Monday–Friday: 8:30AM to 7:00PM</p>
  <p>Saturday: 9:00AM to 7:00PM</p>
  <p>Sunday: Closed</p>
</div>

      </div>
    </div>
  </footer>
 );

};

export default Footer
