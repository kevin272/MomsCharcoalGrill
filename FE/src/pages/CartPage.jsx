import React, { useState } from 'react'
import Breadcrumb from '../components/CateringHero'

function CartPage() {
  const [showSpecialRequirements, setShowSpecialRequirements] = useState(false)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Matar Paneer",
      description: "Silky white sauce with parmesan and herbs",
      price: 33,
      quantity: 2,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/9725464867cbeb7ad22a2ada279140f0d0c20d51?width=259"
    },
    {
      id: 2,
      name: "Matar Paneer",
      description: "Silky white sauce with parmesan and herbs",
      price: 33,
      quantity: 2,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/9725464867cbeb7ad22a2ada279140f0d0c20d51?width=259"
    },
    {
      id: 3,
      name: "Matar Paneer",
      description: "Silky white sauce with parmesan and herbs",
      price: 33,
      quantity: 2,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/9725464867cbeb7ad22a2ada279140f0d0c20d51?width=259"
    }
  ])

  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    phoneNumber: '',
    street: '',
    suburb: '',
    state: '',
    postCode: ''
  })

  const [specialRequirements, setSpecialRequirements] = useState('')

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const gst = Math.round(subtotal * 0.1)
  const deliveryCharge = 50
  const grandTotal = subtotal + gst + deliveryCharge

  const handlePlaceOrder = () => {
    setShowSpecialRequirements(true)
  }

  const handleSpecialRequirementsSubmit = () => {
    setShowSpecialRequirements(false)
    setShowCustomerDetails(true)
  }

  const handleCustomerDetailsSubmit = () => {
    setShowCustomerDetails(false)
    alert('Order placed successfully!')
  }

  const handleInputChange = (field, value) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="cart-page">
      <Breadcrumb
        title="YOUR CART" 
        backgroundImage="https://api.builder.io/api/v1/image/assets/TEMP/c5b6ac01a0354911c3cfb9509937ca83d99d546a?width=3456" 
      />

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-items-container">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-card">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-description">{item.description}</p>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <div className="quantity-display">
                          {item.quantity}
                        </div>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-price">
                        $ {item.price}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  className="remove-item-btn"
                  onClick={() => removeItem(item.id)}
                >
                  <svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24.6016 3.99988C35.6616 3.99988 44.6016 12.9399 44.6016 23.9999C44.6016 35.0599 35.6616 43.9999 24.6016 43.9999C13.5416 43.9999 4.60156 35.0599 4.60156 23.9999C4.60156 12.9399 13.5416 3.99988 24.6016 3.99988ZM31.7816 13.9999L24.6016 21.1799L17.4216 13.9999L14.6016 16.8199L21.7816 23.9999L14.6016 31.1799L17.4216 33.9999L24.6016 26.8199L31.7816 33.9999L34.6016 31.1799L27.4216 23.9999L34.6016 16.8199L31.7816 13.9999Z" fill="#FFF200"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary-section">
          <div className="order-summary-card">
            <div className="order-summary-header">
              <span className="order-total-label">Your Order Total</span>
              <span className="order-total-amount">${subtotal}</span>
            </div>
            
            <div className="payment-details">
              <div className="payment-mode-label">Payment Mode</div>
              <div className="payment-dropdown">
                <span>Cash on Delivery/ Call to pay</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.125 0.914795L5.81234 7.26313L11.4997 0.914795H0.125Z" fill="#A0A0A0"/>
                </svg>
              </div>
              <div className="account-number">Account No. 123 222 222323 2</div>
              
              <div className="order-breakdown">
                <div className="breakdown-item">
                  <span>GST (10%)</span>
                  <span>$ {gst}</span>
                </div>
                <div className="breakdown-item">
                  <span>Delivery Charge</span>
                  <span>$ {deliveryCharge}</span>
                </div>
                <div className="breakdown-divider"></div>
                <div className="breakdown-total">
                  <span>Grand Total</span>
                  <span>$ {grandTotal}</span>
                </div>
              </div>
            </div>
            
            <button className="place-order-btn" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </div>
      </div>


      {/* Special Requirements Modal */}
      {showSpecialRequirements && (
        <div className="modal-overlay">
          <div className="special-requirements-modal">
            <div className="modal-header">
              <h3>Any Special Requirements?</h3>
            </div>
            <div className="requirements-input">
              <textarea 
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Enter any special requirements..."
              />
            </div>
            <button 
              className="modal-submit-btn"
              onClick={handleSpecialRequirementsSubmit}
            >
              SUBMIT
            </button>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && (
        <div className="modal-overlay">
          <div className="customer-details-modal">
            <div className="modal-header">
              <h3>Fill in your details</h3>
            </div>
            <div className="customer-form">
              <input 
                type="text"
                placeholder="Full Name"
                value={customerDetails.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
              <input 
                type="tel"
                placeholder="Phone Number"
                value={customerDetails.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
              <div className="form-row">
                <input 
                  type="text"
                  placeholder="Street"
                  value={customerDetails.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                />
                <input 
                  type="text"
                  placeholder="Suburb"
                  value={customerDetails.suburb}
                  onChange={(e) => handleInputChange('suburb', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="state-dropdown">
                  <select 
                    value={customerDetails.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  >
                    <option value="">State</option>
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="QLD">QLD</option>
                    <option value="WA">WA</option>
                    <option value="SA">SA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>
                </div>
                <input 
                  type="text"
                  placeholder="Post Code"
                  value={customerDetails.postCode}
                  onChange={(e) => handleInputChange('postCode', e.target.value)}
                />
              </div>
              <div className="contact-info-text">
                Incase of confusion, Please contact: <span className="contact-number">123 1313 12121</span>
              </div>
            </div>
            <button 
              className="modal-submit-btn"
              onClick={handleCustomerDetailsSubmit}
            >
              SUBMIT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
