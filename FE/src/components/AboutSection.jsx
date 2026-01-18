import React from 'react'
import { Link } from 'react-router-dom'

const About = () => (
  <section id="about" className="about-section">
    <div className="container">
      <div className="about-image">
        <img src="/Rectangle 159.png" alt="Restaurant Interior" />
      </div>

      <div className="about-content">
        <h2>Mum's Charcoal & Grill</h2>
        <p>
          Mum's Charcoal & Grill opened its doors in December 2016 at Pialba
          Place, introducing authentic charcoal-grilled cuisine to Hervey Bay.
          The idea was born in 2015, when two brothers visited the region and
          immediately felt at home.


        </p>
        <p>
          Hervey Bay's relaxed lifestyle, friendly community, and climate
          reminded them of their hometown of Pokhara, Nepal. What they
          could not find, however, was a place that served the style of charcoal
          chicken they had grown up enjoying.
        </p>
        <a
          href="https://www.couriermail.com.au/news/queensland/fraser-coast/the-business-taking-hervey-bays-tastebuds-by-storm/news-story/24a9355d845e424a273ca55f709f288c"
        >
          <button
            className="read-more px-4 py-2 bg-blue-600 text-white rounded-3xl outline-none transform scale-110 hover:scale-125 transition-transform duration-300"
          >
            Read More
          </button>
        </a>

      </div>
    </div>
  </section>
)

export default About
