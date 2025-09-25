import React, { useState } from 'react'

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    enquiry: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // TODO: integrate with backend or email service
  }

  return (
    <section className="contact-section">
      <div className="container">
        <h2>CONTACT US</h2>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-left">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="NAME"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="EMAIL"
              required
            />
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="CONTACT"
              required
            />
          </div>

          <div className="form-right">
            <textarea
              name="enquiry"
              value={formData.enquiry}
              onChange={handleInputChange}
              placeholder="ENQUIRY"
              required
            />
          </div>

          <button type="submit" className="send-button">Send Message</button>
        </form>
      </div>
    </section>
  )
}

export default ContactSection
