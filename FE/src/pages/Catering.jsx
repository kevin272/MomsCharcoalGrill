import React from 'react'
import CateringOptions from '../components/CateringOptions'
import CateringMenu from '../components/CateringMenu'
import Breadcrumb from '../components/CateringHero'

const Catering = () => {
  return (
    <div className="catering-page">
      <Breadcrumb title="Catering" backgroundImage="https://cdn.builder.io/api/v1/image/assets/TEMP/a9fd22e3a359f40ffb1118dbcd9675ce54d23edb?width=3456"/>
      <CateringOptions />
      <CateringMenu />
    </div>
  )
}

export default Catering
