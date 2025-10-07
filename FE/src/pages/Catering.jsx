import React from 'react'
import CateringOptions from '../components/CateringOptions'
import CateringMenu from '../components/CateringMenu'
import Breadcrumb from '../components/CateringHero'

const Catering = () => {
  return (
    <div className="catering-page">
      <Breadcrumb title="Catering" backgroundImage="./Caterin.png"/>
      <CateringOptions />
      <CateringMenu />
    </div>
  )
}

export default Catering
