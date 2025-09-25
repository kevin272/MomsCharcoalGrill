import React from 'react'

function Breadcrumb({ title, background, children }) {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <img src={background} alt={`${title} Background`} />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {children && <div className="breadcrumb-extra">{children}</div>}
      </div>
    </section>
  )
}

export default Breadcrumb
