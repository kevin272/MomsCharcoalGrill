import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/CateringHero';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../components/common/ToastProvider.jsx';
import { DEFAULT_DELIVERY_FEE, fetchDeliveryFee } from '../utils/settings';

const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

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
  const [fulfillmentMethod, setFulfillmentMethod] = useState('delivery');
  const [showSpecialRequirements, setShowSpecialRequirements] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const toast = useToast()
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [customerErrors, setCustomerErrors] = useState({});
  const [customerFormError, setCustomerFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_DELIVERY_FEE);
  const closeSpecialRequirements = () => setShowSpecialRequirements(false);
  const closeCustomerDetails = () => {
    setShowCustomerDetails(false);
    setCustomerErrors({});
    setCustomerFormError('');
    setIsSubmitting(false);
  };
  const closeOrderSuccess = () => setOrderSuccess(null);

  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    street: '',
    suburb: '',
    state: '',
    postCode: '',
  });
  const [specialRequirements, setSpecialRequirements] = useState('');
  useEffect(() => {
    let mounted = true;
    (async () => {
      const fee = await fetchDeliveryFee();
      if (mounted && typeof fee === 'number' && !Number.isNaN(fee)) {
        setDeliveryFee(fee);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
  const deliveryCharge = cartItems.length > 0 && fulfillmentMethod !== 'pickup'
    ? deliveryFee
    : 0;
  const grandTotal = subtotal + gst + deliveryCharge;
  const deliveryLabel = fulfillmentMethod === 'pickup' ? 'Pickup' : 'Delivery Charge';
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
    setCustomerErrors({});
    setCustomerFormError('');
    setShowCustomerDetails(true);
  };

  const validateCustomerDetails = () => {
    const errors = {};
    if (!customerDetails.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!customerDetails.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required.';
    const email = customerDetails.email.trim();
    if (!email) errors.email = 'Email is required.';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
    if (fulfillmentMethod === 'delivery') {
      if (!customerDetails.street.trim()) errors.street = 'Street is required.';
      if (!customerDetails.suburb.trim()) errors.suburb = 'Suburb is required.';
      if (!customerDetails.state.trim()) errors.state = 'State is required.';
      if (!customerDetails.postCode.trim()) errors.postCode = 'Post code is required.';
    }
    return errors;
  };

const handleCustomerDetailsSubmit = async () => {
  const errors = validateCustomerDetails();
  if (Object.keys(errors).length) {
    setCustomerErrors(errors);
    setCustomerFormError('Please fix the highlighted fields.');
    return;
  }

  setCustomerErrors({});
  setCustomerFormError('');
  setIsSubmitting(true);
  const address = fulfillmentMethod === 'delivery'
    ? [customerDetails.street, customerDetails.suburb, customerDetails.state, customerDetails.postCode]
        .filter(Boolean)
        .join(', ')
    : '';

  const orderData = {
    items: cartItems.map((item) => {
      const selections = Array.isArray(item.items)
        ? item.items.map((sel) => ({
            menuItem: sel.menuItem || sel.id || null,
            name: sel.name,
            qty: sel.qty,
            extras: sel.extras || [],
          }))
        : [];

      const selectionSummary = selections.length
        ? selections
            .map((sel) => {
              const extras = Array.isArray(sel.extras) && sel.extras.length
                ? ` (${sel.extras.join(', ')})`
                : '';
              return `${sel.name || ''} x${sel.qty || 0}${extras}`;
            })
            .join(' | ')
        : (item.extra || '');

      return {
        menuItem: item.menuItem || null,
        name: item.name,
        extra: item.extra || '',
        price: item.price,
        image: item.image,
        qty: item.quantity,
        glutenFree: !!item.glutenFree,
        items: selections,
        selectedItems: selections, // keep legacy + explicit fields
        selectionSummary,
      };
    }),
    customer: {
      name: customerDetails.fullName,
      phone: customerDetails.phoneNumber,
      email: customerDetails.email || '',
      address,
    },
    delivery: { method: fulfillmentMethod },
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

  let base = (RAW || devGuess).replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) {
    const origin = typeof window !== 'undefined' && window.location
      ? window.location.origin
      : '';
    const path = base.startsWith('/') ? base : `/${base || ''}`;
    base = `${origin}${path}`.replace(/\/+$/, '');
  }
  const API_BASE = `${base}/`;
  const url = `${API_BASE}orders/checkout`;

  console.log('Placing order', url);

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
    setShowCustomerDetails(false);
    const orderId = data?.data?._id || data?.data?.id || data?.orderId || 'N/A';
    setOrderSuccess({ id: orderId });
    setSpecialRequirements('');
    setCustomerDetails({
      fullName: '',
      phoneNumber: '',
      email: '',
      street: '',
      suburb: '',
      state: '',
      postCode: '',
    });
    toast.success(`Order placed successfully! Order ID: ${orderId}`);
  } catch (err) {
    console.error(err);
    setCustomerFormError(`Failed to place order: ${err?.message || 'Unknown error'}`);
  } finally {
    setIsSubmitting(false);
  }
};


  const handleInputChange = (field, value) => {
    setCustomerDetails((prev) => ({ ...prev, [field]: value }));
    setCustomerErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (customerFormError) setCustomerFormError('');
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
                      <div>
                        {item.glutenFree && (
                          <span className="gf-badge" aria-label="Gluten free">GF</span>
                        )}
                      </div>
                      <h3 className="cart-item-name">{item.name}</h3>
                      {item.description && (
                        <p className="cart-item-description">{item.description}</p>
                      )}
                      {(item.items && item.items.length) ? (
                        <p className="cart-item-description text-xs opacity-80">
                          Selection: {item.items.map((sel) => {
                            const extras = Array.isArray(sel.extras) && sel.extras.length
                              ? ` (${sel.extras.join(", ")})`
                              : "";
                            return `${sel.name || ""} x${sel.qty || 0}${extras}`;
                          }).join(" | ")}
                        </p>
                      ) : (
                        item.extra && (
                          <p className="cart-item-description text-xs opacity-80">
                            Selection: {item.extra}
                          </p>
                        )
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
                      <div className="cart-item-price">AUD {item.price}</div>
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
              <span className="order-total-amount">AUD {subtotal}</span>
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

  <div className="payment-mode-label">Order Type</div>
  <label className="select-wrap">
    <select
      className="payment-select"
      value={fulfillmentMethod}
      onChange={(e) => setFulfillmentMethod(e.target.value)}
    >
      <option value="delivery">Delivery</option>
      <option value="pickup">Pickup</option>
    </select>
  </label>
</div>
{paymentMode === "PAY_TO_CALL" && (
  <p className="account-hint">
    <span>Account Name: <strong>AM SISTERS PTY LTD</strong></span><br />
    <span>BSB: <strong>082-356</strong></span><br />
    <span>Account No.: <strong>936056394</strong></span>
  </p>
)}

  <div className="order-breakdown">
    <div className="breakdown-item">
      <span>GST (10%)</span>
      <span>AUD {gst}</span>
    </div>
    <div className="breakdown-item">
      <span>{deliveryLabel}</span>
      <span>AUD {deliveryCharge}</span>
    </div>
    <div className="breakdown-divider"></div>
    <div className="breakdown-total">
      <span>Grand Total</span>
      <span>AUD {grandTotal}</span>
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
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSpecialRequirements();
          }}
        >
          <div className="special-requirements-modal">
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeSpecialRequirements}
              aria-label="Close popup"
            >
              <span className="modal-close-icon" aria-hidden="true">X</span>
            </button>
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
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCustomerDetails();
          }}
        >
          <div className="customer-details-modal">
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeCustomerDetails}
              aria-label="Close popup"
            >
              <span className="modal-close-icon" aria-hidden="true">X</span>
            </button>
            <div className="modal-header">
              <h3>Fill in your details</h3>
            </div>
              <div className="customer-form">
                {customerFormError && (
                  <div className="form-error-banner" role="alert">
                    {customerFormError}
                  </div>
                )}
                <div className="field-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customerDetails.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={customerErrors.fullName ? "input-error" : ""}
                    aria-invalid={!!customerErrors.fullName}
                  />
                  {customerErrors.fullName && (
                    <span className="form-error-text">{customerErrors.fullName}</span>
                  )}
                </div>
              <div className="field-group">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerDetails.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={customerErrors.phoneNumber ? "input-error" : ""}
                  aria-invalid={!!customerErrors.phoneNumber}
                />
                {customerErrors.phoneNumber && (
                  <span className="form-error-text">{customerErrors.phoneNumber}</span>
                )}
              </div>
                <div className="field-group">
                  <input
                    type="email"
                    placeholder="Email (for order confirmation)"
                    value={customerDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={customerErrors.email ? "input-error" : ""}
                    aria-invalid={!!customerErrors.email}
                  />
                  {customerErrors.email && (
                    <span className="form-error-text">{customerErrors.email}</span>
                  )}
                </div>
              {fulfillmentMethod === 'delivery' ? (
                <>
                  <div className="form-row">
                    <div className="field-group">
                      <input
                        type="text"
                        placeholder="Street Name and Number"
                        value={customerDetails.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        className={customerErrors.street ? "input-error" : ""}
                        aria-invalid={!!customerErrors.street}
                      />
                      {customerErrors.street && (
                        <span className="form-error-text">{customerErrors.street}</span>
                      )}
                    </div>
                    <div className="field-group">
                      <input
                        type="text"
                        placeholder="Suburb"
                        value={customerDetails.suburb}
                        onChange={(e) => handleInputChange('suburb', e.target.value)}
                        className={customerErrors.suburb ? "input-error" : ""}
                        aria-invalid={!!customerErrors.suburb}
                      />
                      {customerErrors.suburb && (
                        <span className="form-error-text">{customerErrors.suburb}</span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group state-dropdown">
                      <select
                        value={customerDetails.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={customerErrors.state ? "input-error" : ""}
                        aria-invalid={!!customerErrors.state}
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
                      {customerErrors.state && (
                        <span className="form-error-text">{customerErrors.state}</span>
                      )}
                    </div>
                    <div className="field-group">
                      <input
                        type="text"
                        placeholder="Post Code"
                        value={customerDetails.postCode}
                        onChange={(e) => handleInputChange('postCode', e.target.value)}
                        className={customerErrors.postCode ? "input-error" : ""}
                        aria-invalid={!!customerErrors.postCode}
                      />
                      {customerErrors.postCode && (
                        <span className="form-error-text">{customerErrors.postCode}</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="contact-info-text">
                  Pickup selected. No delivery address required.
                </div>
              )}
              <div className="contact-info-text">
                Incase of confusion, Please contact:{' '}
                <span className="contact-number">+61741942975</span>
              </div>
            </div>
            <button
              className="modal-submit-btn"
              onClick={handleCustomerDetailsSubmit}
              disabled={isSubmitting}
            >
              SUBMIT
            </button>
          </div>
        </div>
      )}

      {orderSuccess && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeOrderSuccess();
          }}
        >
          <div className="customer-details-modal success-modal">
            <div className="success-glow" aria-hidden />
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeOrderSuccess}
              aria-label="Close popup"
            >
              <span className="modal-close-icon" aria-hidden="true">X</span>
            </button>
            <div className="modal-header">
              <div className="success-icon" aria-hidden>✓</div>
              <div>
                <h3>Order placed successfully</h3>
                <p className="text-sm opacity-80">
                  Ref <span className="font-semibold">{orderSuccess.id}</span>
                </p>
              </div>
            </div>
            <p className="text-sm opacity-80">
              We’ve logged your order and will confirm delivery details shortly. A confirmation email is on its way.
            </p>
            <div className="extras-actions success-actions">
              <button
                className="modal-submit-btn secondary"
                onClick={closeOrderSuccess}
              >
                Close
              </button>
              <button
                className="modal-submit-btn"
                onClick={() => {
                  closeOrderSuccess();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
