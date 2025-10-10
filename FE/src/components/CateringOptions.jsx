import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A card representing a single catering option.
 * Displays an image, minimum people requirement, title, description and
 * optionally a link. If `linkTo` is provided, a React Router link is
 * rendered; otherwise a disabled button is shown.  Images should live in
 * the public folder or be external URLs.
 */
function CateringOptionCard({ image, minPeople, optionTitle, description, linkTo }) {
  return (
    <div className="catering-option-card">
      <div className="catering-option-image">
        <img src={image} alt="Catering option" />
      </div>
      <div className="catering-option-content">
        <p className="catering-min-people">{minPeople}</p>
        <h3 className="catering-option-title">{optionTitle}</h3>
        <p className="catering-option-description">{description}</p>
        {linkTo ? (
          <Link to={linkTo} className="catering-view-menu-btn">
            VIEW FULL MENU
          </Link>
        ) : (
          <button className="catering-view-menu-btn" disabled>
            VIEW FULL MENU
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * CateringOptions component
 *
 * Renders a grid of preset catering packages. The first option links to the
 * hot dishes page; subsequent options link to individual option menus. Feel
 * free to adjust the `options` array to match your offerings.  Add or
 * remove entries as needed; each should include an image, minimum people
 * requirement, title, description and optional `linkTo` route.
 */
export default function CateringOptions() {
  const options = [
    {
      image:
        'https://api.builder.io/api/v1/image/assets/TEMP/e5104aca6d5bec1e7893cef875a030addc065fda?width=573',
      minPeople: 'Minimum 20 People',
      optionTitle: 'HOT DISHES ($160.00 per tray)',
      description:
        'Chicken, salad (potato, pumpkin, Greek or Asian), bread rolls and veggies.',
      linkTo: '/catering/hot-dishes',
    },
    {
      image:
        'https://api.builder.io/api/v1/image/assets/TEMP/996d39c0b51d5765d66f6e3fcdc088212af2611f?width=573',
      minPeople: 'Minimum 20 People',
      optionTitle: 'OPTION 1 ($25.90 per person)',
      description:
        'Tender meats, fresh salads and sides. Perfect for corporate events and larger gatherings.',
      linkTo: '/catering/option1',
    },
    {
      image:
        'https://api.builder.io/api/v1/image/assets/TEMP/88e90b2348d48f0f02232f4569057214b9bfc79c?width=573',
      minPeople: 'Minimum 20 People',
      optionTitle: 'OPTION 2 ($21.90 per person)',
      description:
        'A lighter package with assorted meats, seasonal vegetables and breads.',
      linkTo: '/catering/option2',
    },
  ];

  return (
    <section className="catering-options-section">
      <div className="container">
        <div className="catering-options-grid">
          {options.map((opt, idx) => (
            <CateringOptionCard key={idx} {...opt} />
          ))}
        </div>
      </div>
    </section>
  );
}