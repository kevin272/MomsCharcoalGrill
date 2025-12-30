import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import PromoBanner from '../components/Banner'
import Hero from '../components/Hero'
import MenuCarousel from '../components/MenuCarousel'
import About from '../components/AboutSection'
import ContactSection from '../components/common/ContactSection'

function Home() {
  const prefersReducedMotion = useReducedMotion()
  const baseTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: 'easeOut' }

  const heroMotion = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0, transition: baseTransition },
  }

  const sectionMotion = (delay = 0) => ({
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0, transition: { ...baseTransition, delay } },
    viewport: { once: true, amount: 0.2 },
  })

  return (
    <div className="homepage">
      <motion.section {...heroMotion}>
        <Hero />
      </motion.section>
      <motion.section {...sectionMotion(0.05)}>
        <MenuCarousel />
      </motion.section>
      <motion.section {...sectionMotion(0.1)}>
        <About />
      </motion.section>
      <motion.section {...sectionMotion(0.12)}>
        <ContactSection />
      </motion.section>
    </div>
  )
}

export default Home
