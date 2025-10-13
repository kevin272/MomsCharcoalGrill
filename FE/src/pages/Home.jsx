import React from 'react'
import PromoBanner from '../components/Banner'
import Hero from '../components/Hero'
import MenuCarousel from '../components/MenuCarousel'
import About from '../components/AboutSection'
import ContactSection from '../components/common/ContactSection'

function Home() {
  return (
    <div className="homepage">
      <Hero />
      <MenuCarousel />
      <About />
      <ContactSection />
    </div>
  )
}

export default Home
