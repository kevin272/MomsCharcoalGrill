import React from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

/**
 * CateringOptionPage
 *
 * Displays the menu items for a given catering option. The option is
 * determined by the `optionId` route parameter. Each item can be added
 * to the cart using the global cart context.  This page reuses much of
 * the HotDishes layout for simplicity but could be customized further.
 */
export default function CateringOptionPage() {
  const { optionId } = useParams();
  const { addToCart } = useCart();

  // Define the menu items for each catering option. In a real application
  // these would likely come from the backend; here they are hard‑coded
  // for demonstration.  Ensure unique ids across options by prefixing
  // each id with the option key.
  const optionMenus = {
    option1: [
      {
        id: 'chicken',
        name: 'Roast Chicken',
        price: 25.9,
        description: 'Juicy roast chicken with herbs and spices.',
        image:
          'https://images.pexels.com/photos/161887/chicken-dishes-food-lunch-161887.jpeg?auto=compress&cs=tinysrgb&w=480',
      },
      {
        id: 'salad',
        name: 'Mixed Salad',
        price: 12.5,
        description: 'Fresh greens with seasonal vegetables and dressing.',
        image:
          'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=480',
      },
      {
        id: 'bread',
        name: 'Bread Rolls',
        price: 5.0,
        description: 'Warm bread rolls served with butter.',
        image:
          'https://images.pexels.com/photos/2434/food-wood-coffee-breakfast.jpg?auto=compress&cs=tinysrgb&w=480',
      },
    ],
    option2: [
      {
        id: 'ham',
        name: 'Glazed Ham',
        price: 21.9,
        description: 'Slow roasted ham with a honey glaze.',
        image:
          'https://images.pexels.com/photos/3062247/pexels-photo-3062247.jpeg?auto=compress&cs=tinysrgb&w=480',
      },
      {
        id: 'veggie',
        name: 'Roasted Vegetables',
        price: 10.5,
        description: 'Assorted seasonal vegetables roasted to perfection.',
        image:
          'https://images.pexels.com/photos/2284166/pexels-photo-2284166.jpeg?auto=compress&cs=tinysrgb&w=480',
      },
      {
        id: 'dessert',
        name: 'Mini Desserts',
        price: 8.5,
        description: 'An assortment of bite‑sized sweets.',
        image:
          'https://images.pexels.com/photos/3026803/pexels-photo-3026803.jpeg?auto=compress&cs=tinysrgb&w=480',
      },
    ],
  };

  // Fallback if the optionId is unknown
  const items = optionMenus[optionId] || [];

  // Add item to cart with a prefixed id to avoid collisions
  const handleAddToCart = (item) => {
    addToCart({
      id: `${optionId}-${item.id}`,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <div className="option-menu-page">
      <main className="hot-dishes-main">
        <div className="hot-dishes-hero">
          <div className="container">
            <h1 className="hot-dishes-title">
              {optionId === 'option1'
                ? 'OPTION 1 MENU'
                : optionId === 'option2'
                ? 'OPTION 2 MENU'
                : 'CATERING MENU'}
            </h1>
            <p className="hot-dishes-subtitle">Feeds 10-15 People</p>
          </div>
        </div>
        <section className="hot-dishes-grid-section">
          <div className="container">
            <div className="hot-dishes-grid">
              {items.length === 0 && (
                <p>No menu available for this option.</p>
              )}
              {items.map((item) => (
                <div key={item.id} className="hot-dish-card">
                  <div className="hot-dish-image-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="hot-dish-image"
                    />
                  </div>
                  <div className="hot-dish-content">
                    <div className="hot-dish-header">
                      <h3 className="hot-dish-name">{item.name}</h3>
                      <span className="hot-dish-price">${item.price}</span>
                    </div>
                    <p className="hot-dish-description">{item.description}</p>
                    <button
                      className="hot-dish-cart-btn"
                      aria-label="Add to cart"
                      onClick={() => handleAddToCart(item)}
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
}