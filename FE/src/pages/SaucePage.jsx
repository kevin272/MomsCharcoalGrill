import React from 'react';
import Breadcrumb from '../components/CateringHero';
import { useCart } from '../context/CartContext.jsx';

/**
 * SaucePage component.
 *
 * Displays a selection of sauces that can be added to the cart.  Each sauce
 * has a name, price, description and image.  Clicking on the cart button
 * invokes `addToCart` from the cart context, storing the item with a unique
 * identifier so that it does not collide with hot dishes or other categories.
 */
const SaucePage = () => {
  const { addToCart } = useCart();
  // API base from env or default
  const API_BASE =
    (import.meta.env && import.meta.env.VITE_API_URL) ||
    'http://localhost:5000/api';

  // State to hold sauces, loading and error
  const [sauces, setSauces] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Fetch available sauces from the backend on mount
  React.useEffect(() => {
    let isMounted = true;
    async function fetchSauces() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}sauces`);
        if (!res.ok) {
          throw new Error(`Failed to fetch sauces: ${res.statusText}`);
        }
        const body = await res.json();
        const list = Array.isArray(body?.data) ? body.data : [];
        if (isMounted) {
          setSauces(
            list
              .filter((item) => item.isAvailable !== false)
              .map((item) => ({
                id: item._id || item.id,
                name: item.name,
                price: Number(item.price || 0),
                description: item.description || '',
                image: item.image || '',
              }))
          );
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          // In case the API is unavailable (e.g. in the stripped down demo),
          // fall back to a static list so the UI still renders.
          setError(err.message || 'Could not load sauces');
          setSauces([
            {
              id: 1,
              name: 'Sample Sauce',
              price: 80,
              description: 'Silky white sauce with parmesan and herbs.',
              image: '/sauce/Ellipse 18.png',
            },
            {
              id: 2,
              name: 'Sample Sauce',
              price: 80,
              description: 'Silky white sauce with parmesan and herbs.',
              image: '/sauce/Ellipse 20.png',
            },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSauces();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle adding a sauce to the cart. Prefix the id so it remains unique
  const handleAddToCart = (sauce) => {
    addToCart({
      id: `sauce-${sauce.id}`,
      name: sauce.name,
      price: sauce.price,
      image: sauce.image,
    });
  };

  return (
    <div className="sauces-page">
      <Breadcrumb title="SAUCES" backgroundImage="/Saus.jpg" />
      <section className="sauces-grid-section">
        <div className="sauces-container">
          {loading && <p>Loading…</p>}
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
          <div className="sauces-grid">
            {sauces.map((sauce) => (
              <div key={sauce.id} className="sauce-item">
                <div className="sauce-background">
                  <svg
                    className="sauce-bg-shape"
                    viewBox="0 0 524 255"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      opacity="0.4"
                      d="M123.545 254.208C82.585 254.208 46.9357 236.132 23.705 204.8C0.474188 173.468 -3.23007 139.955 2.20096 107.264C7.63199 74.5734 17.331 54.5152 41.881 32.256C66.4309 9.99677 84.8889 2.92918e-05 123.545 9.01286e-06C162.201 -1.12661e-05 523.673 9.01286e-06 523.673 9.01286e-06V254.208C523.673 254.208 164.505 254.208 123.545 254.208Z"
                      fill="url(#paint0_linear)"
                      fillOpacity="0.4"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear"
                        x1="181.401"
                        y1="167.424"
                        x2="557.782"
                        y2="159.589"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#CAC9B6" />
                        <stop offset="0.347152" stopColor="#9B9A8F" />
                        <stop offset="0.578258" stopColor="#3E3E3E" />
                        <stop offset="1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="sauce-image-container">
                  <img src={sauce.image} alt={sauce.name} className="sauce-image" />
                </div>
                <div className="sauce-content">
                  <h3 className="sauce-name">{sauce.name}</h3>
                  <p className="sauce-price">${sauce.price}</p>
                  <p className="sauce-description">{sauce.description}</p>
                </div>
                <button
                  className="sauce-cart-button"
                  aria-label="Add to cart"
                  onClick={() => handleAddToCart(sauce)}
                >
                  <svg
                    width="47"
                    height="47"
                    viewBox="0 0 47 47"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M37.6006 30.9731H12.9872L8.25391 12.0398H42.3339L37.6006 30.9731Z" fill="#FAEB30" />
                    <path
                      d="M3.51953 6.35986H6.83286L8.25286 12.0399M8.25286 12.0399L12.9862 30.9732H37.5995L42.3329 12.0399H8.25286Z"
                      stroke="#FAEB30"
                      strokeWidth="1.28"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.9845 40.4398C14.553 40.4398 15.8245 39.1683 15.8245 37.5998C15.8245 36.0313 14.553 34.7598 12.9845 34.7598C11.416 34.7598 10.1445 36.0313 10.1445 37.5998C10.1445 39.1683 11.416 40.4398 12.9845 40.4398Z"
                      stroke="#FAEB30"
                      strokeWidth="1.28"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M37.5978 40.4398C39.1663 40.4398 40.4378 39.1683 40.4378 37.5998C40.4378 36.0313 39.1663 34.7598 37.5978 34.7598C36.0293 34.7598 34.7578 36.0313 34.7578 37.5998C34.7578 39.1683 36.0293 40.4398 37.5978 40.4398Z"
                      stroke="#FAEB30"
                      strokeWidth="1.28"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaucePage;