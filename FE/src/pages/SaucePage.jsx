import React from "react";
import Breadcrumb from "../components/CateringHero";
import { useCart } from "../context/CartContext.jsx";

const SaucePage = () => {
  const { addToCart, items:cartItems } = useCart();

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

  const isInCart = React.useCallback(
    (sauce) => cartItems.some((item) => item.id === `sauce-${sauce.id}`),
    [cartItems]
  );

  const handleAddToCart = (sauce) => {
    addToCart({
      id: `sauce-${sauce.id}`,
      name: sauce.name,
      price: sauce.price,
      image: sauce.image,
    });
  };

  return (
    <div className="hot-dishes-page">
      <Breadcrumb title="SAUCES" backgroundImage="/Saus.jpg" />

      <main className="hot-dishes-main">

        <section className="hot-dishes-grid-section">
          <div className="container catering-hover-wrap">
            <div className="faint-bg" aria-hidden />
            {loading && <p>Loading…</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}

              <div className="hot-dishes-grid">
              {sauces.map((sauce) => {
                const inCart = isInCart(sauce);
              return(
                <div key={sauce.id} className="hot-dish-card">
                  <div className="hot-dish-hover-bg" aria-hidden />

                  <div className="hot-dish-image-container">
                    <img
                      src= {`${sauce.image}`}
                      alt={sauce.name}
                      className="hot-dish-image"
                    />
                  </div>

                  <div className="hot-dish-content">
                    <div className="hot-dish-header">
                      <h3 className="hot-dish-name">{sauce.name}</h3>
                      <span className="hot-dish-price">${sauce.price}</span>
                    </div>
                    <p className="hot-dish-description">{sauce.description}</p>
                    <button
                      className= {`hot-dish-cart-btn ${inCart ? "in-cart" : ""}`}
                      onClick={() => handleAddToCart(sauce)}
                      aria-label="Add to cart"
                    >
                      <svg
                        width="47"
                        height="47"
                        viewBox="0 0 47 47"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M37.6006 30.9731H12.9872L8.25391 12.0398H42.3339L37.6006 30.9731Z"
                          fill="#FAEB30"
                        />
                        <path
                          d="M3.51953 6.35986H6.83286L8.25286 12.0399M8.25286 12.0399L12.9862 30.9732H37.5995L42.3329 12.0399H8.25286Z"
                          stroke="#FAEB30"
                          strokeWidth="1.28"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.9845 40.4399C14.553 40.4399 15.8245 39.1684 15.8245 37.5999C15.8245 36.0314 14.553 34.7599 12.9845 34.7599C11.416 34.7599 10.1445 36.0314 10.1445 37.5999C10.1445 39.1684 11.416 40.4399 12.9845 40.4399Z"
                          stroke="#FAEB30"
                          strokeWidth="1.28"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M37.5978 40.4399C39.1663 40.4399 40.4378 39.1684 40.4378 37.5999C40.4378 36.0314 39.1663 34.7599 37.5978 34.7599C36.0293 34.7599 34.7578 36.0314 34.7578 37.5999C34.7578 39.1684 36.0293 40.4399 37.5978 40.4399Z"
                          stroke="#FAEB30"
                          strokeWidth="1.28"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SaucePage;
