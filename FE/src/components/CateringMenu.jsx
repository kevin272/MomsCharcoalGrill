import React from 'react';

/**
 * CateringMenu component
 *
 * This simple component displays a large catering menu image with an optional
 * download button. It is provided to mirror the original design of the
 * upstream project.  Replace the image source with your own menu graphic
 * or link.
 */
export default function CateringMenu() {
  return (
    <section className="catering-menu-section">
      <div className="container">
        <h2 className="catering-menu-title">OUR CATERING MENU</h2>
        <div className="catering-menu-image-container">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/933806ebd5ca77535fa9023cf2764b3e6ff85935?width=2302"
            alt="Catering Menu"
            className="catering-menu-image"
          />
          <div className="catering-menu-nav-arrow catering-menu-nav-right">
            <svg
              width="58"
              height="77"
              viewBox="0 0 58 77"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.8147e-06 7.01611L8.62608 0.867485L55.6101 34.3775C56.3675 34.9144 56.9686 35.5529 57.3787 36.2562C57.7888 36.9596 58 37.7138 58 38.4756C58 39.2373 57.7888 39.9916 57.3787 40.6949C56.9686 41.3982 56.3675 42.0367 55.6101 42.5737L8.62608 76.1011L0.00813293 69.9525L44.106 38.4843L3.8147e-06 7.01611Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
        <div className="catering-download-section">
          <button className="catering-download-btn">Click here to download menu</button>
        </div>
      </div>
    </section>
  );
}