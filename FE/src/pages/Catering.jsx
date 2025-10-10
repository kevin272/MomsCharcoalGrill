import React from 'react';
import CateringHero from '../components/CateringHero';
import CateringOptions from '../components/CateringOptions';
import CateringMenu from '../components/CateringMenu';

/**
 * Catering page
 *
 * This page acts as an entry point for all catering offerings. It displays
 * a hero banner, a grid of predetermined catering options, and a simple
 * download/menu section.  Each option links to either the hot dishes page
 * or a dedicated option menu page depending on its configuration.
 */
export default function Catering() {
  return (
    <div className="catering-page">
      <CateringHero title="Catering" backgroundImage="/Caterin.png" />
      <CateringOptions />
      <CateringMenu />
    </div>
  );
}