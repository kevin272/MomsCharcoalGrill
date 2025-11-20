import React from 'react';
import { useCart } from '../context/CartContext.jsx';

/**
 * HotDishes page.
 *
 * This component renders a grid of catering trays that feed 10–15 people.  Each
 * dish is statically defined for now.  When the user clicks the cart button
 * the item is added to the global cart via the `useCart` hook.  Prices are
 * stored as numbers to simplify calculations; the UI formats them with a
 * currency symbol.
 */
const HotDishes = () => {
  const { addToCart } = useCart();
  const [glutenFree, setGlutenFree] = React.useState({});
  // Define an array of hot dishes.  Note that price is a number; convert
  // strings from the original design ("$80") into numeric values so that
  // totals can be computed accurately.
  const dishes = [
    {
      id: 1,
      name: 'Pasta',
      price: 80,
      description: 'Silky white sauce with parmesan and herbs.',
      image:
        'https://images.pexels.com/photos/4161714/pexels-photo-4161714.jpeg?auto=compress&cs=tinysrgb&w=480',
    },
    {
      id: 2,
      name: 'Pasta',
      price: 80,
      description: 'Silky white sauce with parmesan and herbs.',
      image:
        'https://images.pexels.com/photos/5894767/pexels-photo-5894767.jpeg?auto=compress&cs=tinysrgb&w=480',
    },
    {
      id: 3,
      name: 'Pasta',
      price: 80,
      description: 'Silky white sauce with parmesan and herbs.',
      image:
        'https://images.pexels.com/photos/6241091/pexels-photo-6241091.jpeg?auto=compress&cs=tinysrgb&w=480',
    },
    {
      id: 4,
      name: 'Pasta',
      price: 80,
      description: 'Silky white sauce with parmesan and herbs.',
      image:
        'https://images.pexels.com/photos/11101711/pexels-photo-11101711.png?auto=compress&cs=tinysrgb&w=480',
    },
    {
      id: 5,
      name: 'Pasta',
      price: 80,
      description: 'Silky white sauce with parmesan and herbs.',
      image:
        'https://images.pexels.com/photos/26597663/pexels-photo-26597663.jpeg?auto=compress&cs=tinysrgb&w=480',
    },
    {
      id: 6,
      name: 'Pasta',
      price: 80,
      description: 'Silky white sauce with parmesan and herbs.',
      image:
        'https://images.pexels.com/photos/29039084/pexels-photo-29039084.jpeg?auto=compress&cs=tinysrgb&w=480',
    },
  ];

  // Add the selected dish to the cart.  Use a prefix on the id to ensure
  // uniqueness across different pages (e.g. hot dishes vs. sauces).  Include
  // name, price and image so the cart has everything it needs.
  const handleAddToCart = (dish) => {
    const gf = !!glutenFree[dish.id];
    addToCart({
      id: `hot-${dish.id}${gf ? '-gf' : ''}`,
      name: gf ? `${dish.name} (GF)` : dish.name,
      price: dish.price,
      image: dish.image,
      glutenFree: gf,
    });
  };

  return (
    <div className="hot-dishes-page">
      <main className="hot-dishes-main">
        <div className="hot-dishes-hero">
          <div className="container">
            <h1 className="hot-dishes-title">HOT DISHES ($160.00 per tray)</h1>
            <p className="hot-dishes-subtitle">Feeds 10-15 People</p>
          </div>
        </div>
        <section className="hot-dishes-grid-section">
          <div className="container">
            <div className="hot-dishes-grid">
              {dishes.map((dish) => (
                <div key={dish.id} className="hot-dish-card">
                  <div className="hot-dish-image-container">
                    <img src={dish.image} alt={dish.name} className="hot-dish-image" />
                  </div>
                    <div className="hot-dish-content">
                      <div className="hot-dish-header">
                        {!!glutenFree[dish.id] && (
                          <span className="gf-badge" aria-label="Gluten free">GF</span>
                        )}
                        <h3 className="hot-dish-name">{dish.name}</h3>
                        <span className="hot-dish-price">${dish.price}</span>
                      </div>
                      <p className="hot-dish-description">{dish.description}</p>
                      <label className="gf-option">
                        <input
                          type="checkbox"
                          checked={!!glutenFree[dish.id]}
                          onChange={(e) => setGlutenFree((m) => ({ ...m, [dish.id]: e.target.checked }))}
                        />
                        <span>Gluten-free (GF)</span>
                      </label>
                      <button
                        className="hot-dish-cart-btn"
                        aria-label="Add to cart"
                        onClick={() => handleAddToCart(dish)}
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
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HotDishes;
