import React from 'react'

/**
 * General-purpose Breadcrumb Hero
 * Uses /AdminBc.jpg from the public folder as background.
 *
 * Props:
 * - title: main heading text
 * - children: optional breadcrumb trail or extra info
 */
function Breadcrumb({ title, children }) {
  const background = '/AdminBc.jpg' // always from public folder

  return (
    <section className="breadcrumb-section">
      <div className="breadcrumb-bg">
        <img src={background} alt={`${title} Background`} />
        <div className="breadcrumb-overlay"></div>
      </div>

      <div className="breadcrumb-content">
        <h1 className="breadcrumb-title">{title}</h1>
        {children && <div className="breadcrumb-extra">{children}</div>}
      </div>
    </section>
  )
}

export default Breadcrumb
