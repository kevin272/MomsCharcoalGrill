import React from 'react';
import { Link } from 'react-router-dom';

const Merchandise = () => {
  return (
    <section className="merch-coming-soon">
      <div className="merch-glow" aria-hidden="true" />
      <div className="merch-content">
        <p className="merch-kicker">Mum&apos;s Merch</p>
        <h1>Merchandise is dropping soon</h1>
        <p className="merch-lede">
          We&apos;re putting the finishing touches on a line of gear that brings the Mum&apos;s Charcoal &
          Grill energy wherever you go. Sign up to be the first to know when the shop opens.
        </p>
        <div className="merch-actions">
          <a className="merch-button merch-button--primary" href="mailto:mumscharcoalandgrill@gmail.com">
            Join the list
          </a>
          <Link className="merch-button merch-button--ghost" to="/catering">
            Explore catering
          </Link>
        </div>
        <p className="merch-note">
          Want to collaborate or have a special request? Reach us anytime at <br className="desktop-break" />
          <a href="mailto:mumscharcoalandgrill@gmail.com">mumscharcoalandgrill@gmail.com</a> or call&nbsp;
          <a href="tel:0297879055">(02) 9787 9055</a>.
        </p>
      </div>
    </section>
  );
};

export default Merchandise;
