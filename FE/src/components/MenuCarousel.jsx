import React from 'react'

const MenuCarousel = () => (
  <section className="menu-carousel">
    <div className="carousel-nav prev">
      <img src="/Vector-1.png" alt="Previous" />
    </div>

    <div className="menu-items">
      <div className="menu-item">
        <img src="/Ellipse 18.png" alt="Pasta" />
        <h3>Pasta</h3>
      </div>
      <div className="menu-item">
        <img src="/Ellipse 14.png" alt="Chicken" />
        <h3>Chicken</h3>
      </div>
      <div className="menu-item">
        <img src="/Ellipse 17.png" alt="Salad" />
        <h3>Salad</h3>
      </div>
      <div className="menu-item">
        <img src="/Ellipse 19.png" alt="Chicken" />
        <h3>Chicken</h3>
      </div>
    </div>

    <div className="carousel-nav next">
      <img src="/Vector.png" alt="Next" />
    </div>

    <div className="carousel-dots">
      <span className="dot active"></span>
      <span className="dot"></span>
    </div>
  </section>
)

export default MenuCarousel
