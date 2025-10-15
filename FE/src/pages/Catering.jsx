import React from 'react';
import CateringHero from '../components/CateringHero';
import CateringOptions from '../components/CateringOptions';
import CateringMenu from '../components/CateringMenu';

export default function Catering() {
  return (
    <div className="catering-page">
      <CateringHero title="Catering" backgroundImage="/Caterin.png" />
      <CateringOptions />
      <CateringMenu />
    </div>
  );
}