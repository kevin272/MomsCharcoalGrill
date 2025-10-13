import React, { useState } from 'react'
import axios from 'axios'

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    enquiry: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}contact`, {
        name: formData.name,
        email: formData.email,
        number: formData.contact,
        subject: 'General Enquiry',
        message: formData.enquiry
      })
      if (res.data.success) {
        setSuccess('Your message has been sent successfully!')
        setError('')
        setFormData({ name: '', email: '', contact: '', enquiry: '' })
      }
    } catch (err) {
      setError('Failed to send message. Please try again later.')
      setSuccess('')
    }
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

        {success && <p className="contact-success">{success}</p>}
        {error && <p className="contact-error">{error}</p>}
      </div>
    </section>
  )
}

export default ContactSection
