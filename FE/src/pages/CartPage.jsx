import React, { useState } from 'react';
import Breadcrumb from '../components/CateringHero';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../components/common/ToastProvider.jsx';

/**
 * Shopping cart / checkout page.  Displays the items currently in the cart
 * using the CartContext and allows the user to enter special requirements
 * and customer details.  On submission it posts the order to the backend
 * using the new `/api/orders/checkout` endpoint.  Upon successful order
 * creation the cart is cleared and a confirmation is shown.
 */
function CartPage() {
  const { items: cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [paymentMode, setPaymentMode] = useState('COD');
  const [showSpecialRequirements, setShowSpecialRequirements] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const toast = useToast()
  
  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    phoneNumber: '',
    street: '',
    suburb: '',
    state: '',
    postCode: '',
  });
  const [specialRequirements, setSpecialRequirements] = useState('');
function resolveImage(src) {
  if (!src) return "";
  const RAW_API = (import.meta?.env?.VITE_API_URL || "").trim();
  const API = RAW_API.replace(/\/+$/, "");
  const ORIGIN = API.replace(/\/api$/, "");
  const escapeRe = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const ORIGIN_RE = new RegExp(`^${escapeRe(ORIGIN)}(?:${escapeRe(ORIGIN)})+`);
  let s = String(src).trim();
  s = s.replace(ORIGIN_RE, ORIGIN);
  if (/^(?:https?:|data:|blob:)/i.test(s)) return s;
  if (!s.startsWith("/")) s = `/${s}`;
  try {
    return new URL(s, ORIGIN).href;
  } catch {
    return `${ORIGIN}${s}`;
  }
}

  // Derived totals based off cart items
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0,
  );
  const gst = Math.round(subtotal * 0.1);
  const deliveryCharge = cartItems.length > 0 ? 50 : 0;
  const grandTotal = subtotal + gst + deliveryCharge;
  const VITE_API = (import.meta?.env?.VITE_API_URL|| "").replace(/\/+$/, "");

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }
    setShowSpecialRequirements(true);
  };

  const handleSpecialRequirementsSubmit = () => {
    setShowSpecialRequirements(false);
    setShowCustomerDetails(true);
  };

const handleCustomerDetailsSubmit = async () => {
  setShowCustomerDetails(false);

  const orderData = {
    items: cartItems.map((item) => ({
      menuItem: item.menuItem || null,
      name: item.name,
      extra: item.extra || '',
      price: item.price,
      image: item.image,
      qty: item.quantity,
    })),
    customer: {
      name: customerDetails.fullName,
      phone: customerDetails.phoneNumber,
      email: customerDetails.email || '',
      address: [customerDetails.street, customerDetails.suburb, customerDetails.state, customerDetails.postCode]
        .filter(Boolean)
        .join(', '),
    },
    paymentMode,
    notes: specialRequirements,
  };

  // --- Resolve API base robustly ---
  const RAW = (import.meta?.env?.VITE_API_URL || '').trim();
  const devGuess = (() => {
    const isLocal =
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1';
    return isLocal ? 'http://localhost:5000/api/' : '';
  })();
  const API_BASE = (RAW || devGuess).replace(/\/+$/, '') + '/';
  const url = new URL('orders/checkout', API_BASE).href;

  console.log('Placing order →', url);

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });

    const ct = resp.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Non-JSON response ${resp.status} ${resp.statusText}. Snippet: ${text.slice(0, 160)}`);
    }

    const data = await resp.json();
    if (!resp.ok || data?.success === false) {
      throw new Error(data?.message || `Request failed (${resp.status})`);
    }

    clearCart();
    toast.success(`Order placed successfully! Order ID: ${data?.data?._id || data?.data?.id || 'N/A'}`);
  } catch (err) {
    console.error(err);
    alert('Failed to place order: ' + (err?.message || 'Unknown error'));
  }
};


  const handleInputChange = (field, value) => {
    setCustomerDetails((prev) => ({ ...prev, [field]: value }));
  };

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
            <img src={resolveImage(item.image)} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.name}</h3>
                      {item.description && (
                        <p className="cart-item-description">{item.description}</p>
                      )}
                      {item.extra && (
                        <p className="cart-item-description text-xs opacity-80">
                          Selection: {item.extra}
                        </p>
                      )}
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <div className="quantity-display">{item.quantity}</div>
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-price">$ {item.price}</div>
                    </div>
                  </div>
                </div>
                <button
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  <svg
                    width="49"
                    height="48"
                    viewBox="0 0 49 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24.6016 3.99988C35.6616 3.99988 44.6016 12.9399 44.6016 23.9999C44.6016 35.0599 35.6616 43.9999 24.6016 43.9999C13.5416 43.9999 4.60156 35.0599 4.60156 23.9999C4.60156 12.9399 13.5416 3.99988 24.6016 3.99988ZM31.7816 13.9999L24.6016 21.1799L17.4216 13.9999L14.6016 16.8199L21.7816 23.9999L14.6016 31.1799L17.4216 33.9999L24.6016 26.8199L31.7816 33.9999L34.6016 31.1799L27.4216 23.9999L34.6016 16.8199L31.7816 13.9999Z"
                      fill="#FFF200"
                    />
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
<div className="payment-details">
  <div className="payment-mode-label">Payment Mode</div>

  <label className="select-wrap">
    <select
      className="payment-select"
      value={paymentMode}
      onChange={(e) => setPaymentMode(e.target.value)}
    >
      <option value="COD">Cash on Delivery</option>
      <option value="PAY_TO_CALL">Call to pay</option>
    </select>
  </label>
</div>
<p className="account-hint">Account No. <strong>123 222 223232 2</strong></p>

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
            <button className="modal-submit-btn" onClick={handleSpecialRequirementsSubmit}>
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
              <input
                type="email"
                placeholder="Email (for order confirmation)"
                value={customerDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Street Name and Number"
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
                Incase of confusion, Please contact:{' '}
                <span className="contact-number">123 1313 12121</span>
              </div>
            </div>
            <button className="modal-submit-btn" onClick={handleCustomerDetailsSubmit}>
              SUBMIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
