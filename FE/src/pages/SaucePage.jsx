import React from "react";
import Breadcrumb from "../components/CateringHero";
import { useCart } from "../context/CartContext.jsx";
const SaucePage = () => {
  const { addToCart, items: cartItems } = useCart();

  const [sauces, setSauces] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const IMG_BASE_URL = (import.meta.env.VITE_API_URL).replace(/\/+$/, "").replace(/\/api$/, "");

  React.useEffect(() => {
    let isMounted = true;
    async function fetchSauces() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta?.env?.VITE_API_URL}sauces`);
        const body = await res.json();
        const list = Array.isArray(body?.data) ? body.data : [];
        if (isMounted) {
          setSauces(
            list.length
              ? list
              : [
                  {
                    id: 1,
                    name: "Sample Sauce",
                    price: 80,
                    description: "Silky white sauce with parmesan and herbs.",
                    image: "/sauce/Ellipse 18.png",
                  },
                  {
                    id: 2,
                    name: "Sample Sauce",
                    price: 80,
                    description: "Smoky BBQ-style sauce with roasted notes.",
                    image: "/sauce/Ellipse 20.png",
                  },
                ]
          );
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Could not load sauces");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSauces();
    return () => {
      isMounted = false;
    };
  }, []);

  const resolveSauceId = React.useCallback((sauce, fallbackIndex = 0) => {
    const rawId = sauce?.id ?? sauce?._id ?? sauce?.slug ?? sauce?.name ?? fallbackIndex;
    return `sauce-${rawId}`;
  }, []);

  const isInCart = React.useCallback(
    (itemId) => cartItems.some((item) => item.id === itemId),
    [cartItems]
  );

  const handleAddToCart = (sauce, itemId) => {
    const id = itemId ?? resolveSauceId(sauce);
    addToCart({
      id,
      name: sauce.name,
      price: sauce.price,
      image: sauce.image,
    });
  };

  return (
    <div className="hot-dishes-page">
      <Breadcrumb title="SAUCES" backgroundImage="/Saus.jpeg" />

      <main className="hot-dishes-main">
        <section className="hot-dishes-grid-section">
          <div className="container catering-hover-wrap">
            <div className="faint-bg" aria-hidden />
            {loading && (
              <div className="hot-dishes-grid hot-dishes-grid--skeleton" aria-busy="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`sauce-skeleton-${index}`}
                    className="hot-dish-card hot-dish-card--skeleton"
                    aria-hidden="true"
                  >
                    <div className="hot-dish-hover-bg" aria-hidden />
                    <div className="hot-dish-image-container">
                      <div className="skeleton skeleton-circle hot-dish-skeleton-image" />
                    </div>
                    <div className="hot-dish-content">
                      <div className="hot-dish-header">
                        <div className="skeleton skeleton-line skeleton-line--wide" />
                        <div className="skeleton skeleton-line skeleton-line--price" />
                      </div>
                      <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "55%" }} />
                      <div className="skeleton skeleton-circle hot-dish-skeleton-cart" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && <p style={{ color: "crimson" }}>{error}</p>}

            {!loading && !error && (
              <div className="hot-dishes-grid">
                {sauces.map((sauce, index) => {
                  const itemId = resolveSauceId(sauce, index);
                  const inCart = isInCart(itemId);
                  return (
                    <div key={itemId} className="hot-dish-card">
                      <div className="hot-dish-hover-bg" aria-hidden />

                      <div className="hot-dish-image-container">
                        <img
                          src={`${sauce.image}`}
                          alt={sauce.name}
                          className="hot-dish-image"
                        />
                      </div>

                      <div className="hot-dish-content">
                        <div className="hot-dish-header">
                          <h3 className="hot-dish-name">{sauce.name}</h3>
                          <span className="hot-dish-price">AUD {sauce.price}</span>
                        </div>
                        <p className="hot-dish-description">{sauce.description}</p>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                          <button
                            className={`hot-dish-cart-btn ${inCart ? "in-cart" : ""}`}
                            onClick={() => handleAddToCart(sauce, itemId)}
                            aria-label="Add to cart"
                          >
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 47 47"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M37.6006 30.9731H12.9872L8.25391 12.0398H42.3339L37.6006 30.9731Z"
                                fill="currentColor"
                              />
                              <path
                                d="M3.51953 6.35986H6.83286L8.25286 12.0399M8.25286 12.0399L12.9862 30.9732H37.5995L42.3329 12.0399H8.25286Z"
                                stroke="currentColor"
                                strokeWidth="1.28"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12.9845 40.4399C14.553 40.4399 15.8245 39.1684 15.8245 37.5999C15.8245 36.0314 14.553 34.7599 12.9845 34.7599C11.416 34.7599 10.1445 36.0314 10.1445 37.5999C10.1445 39.1684 11.416 40.4399 12.9845 40.4399Z"
                                stroke="currentColor"
                                strokeWidth="1.28"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M37.5978 40.4399C39.1663 40.4399 40.4378 39.1684 40.4378 37.5999C40.4378 36.0314 39.1663 34.7599 37.5978 34.7599C36.0293 34.7599 34.7578 36.0314 34.7578 37.5999C34.7578 39.1684 36.0293 40.4399 37.5978 40.4399Z"
                                stroke="currentColor"
                                strokeWidth="1.28"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SaucePage;
