import React from 'react'
import Breadcrumb from '../components/common/Breadcrumb'
import Footer from '../components/common/Footer'

const SaucePage = () => {
  const sauces = [
    {
      id: 1,
      name: "Pasta",
      price: "$80",
      description: "Silky white sauce with parmesan and herbs.",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/0c52cab6e07d5e32d8d9c38767188d8ce6e07106?width=380"
    },
    {
      id: 2,
      name: "Pasta",
      price: "$80", 
      description: "Silky white sauce with parmesan and herbs.",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/cabd48ddcb0f09b9f73982e610f883762c93932b?width=588"
    },
    {
      id: 3,
      name: "Pasta",
      price: "$80",
      description: "Silky white sauce with parmesan and herbs.",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/0c52cab6e07d5e32d8d9c38767188d8ce6e07106?width=380"
    },
    {
      id: 4,
      name: "Pasta", 
      price: "$80",
      description: "Silky white sauce with parmesan and herbs.",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/cabd48ddcb0f09b9f73982e610f883762c93932b?width=588"
    },
    {
      id: 5,
      name: "Pasta",
      price: "$80",
      description: "Silky white sauce with parmesan and herbs.",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/0c52cab6e07d5e32d8d9c38767188d8ce6e07106?width=380"
    },
    {
      id: 6,
      name: "Pasta",
      price: "$80", 
      description: "Silky white sauce with parmesan and herbs.",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/cabd48ddcb0f09b9f73982e610f883762c93932b?width=588"
    }
  ]

  return (
    <div className="sauces-page">
      <Breadcrumb 
        title="SAUCES"
        background="https://api.builder.io/api/v1/image/assets/TEMP/ca991e8d5e8649cac31a0df60ae4617cd900d35c?width=3528"
      />
      
      <div className="sauces-decorative-apple">
        <img src="https://api.builder.io/api/v1/image/assets/TEMP/0c52cab6e07d5e32d8d9c38767188d8ce6e07106?width=380" alt="" />
      </div>
      
      <section className="sauces-grid-section">
        <div className="sauces-container">
          <div className="sauces-grid">
            {sauces.map((sauce) => (
              <div key={sauce.id} className="sauce-item">
                <div className="sauce-background">
                  <svg className="sauce-bg-shape" viewBox="0 0 524 255" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.4" d="M123.545 254.208C82.585 254.208 46.9357 236.132 23.705 204.8C0.474188 173.468 -3.23007 139.955 2.20096 107.264C7.63199 74.5734 17.331 54.5152 41.881 32.256C66.4309 9.99677 84.8889 2.92918e-05 123.545 9.01286e-06C162.201 -1.12661e-05 523.673 9.01286e-06 523.673 9.01286e-06V254.208C523.673 254.208 164.505 254.208 123.545 254.208Z" fill="url(#paint0_linear)" fillOpacity="0.4"/>
                    <defs>
                      <linearGradient id="paint0_linear" x1="181.401" y1="167.424" x2="557.782" y2="159.589" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#CAC9B6"/>
                        <stop offset="0.347152" stopColor="#9B9A8F"/>
                        <stop offset="0.578258" stopColor="#3E3E3E"/>
                        <stop offset="1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                <div className="sauce-image-container">
                  <img src={sauce.image} alt={sauce.name} className="sauce-image" />
                </div>
                
                <div className="sauce-content">
                  <h3 className="sauce-name">{sauce.name}</h3>
                  <p className="sauce-price">{sauce.price}</p>
                  <p className="sauce-description">{sauce.description}</p>
                </div>
                
                <button className="sauce-cart-button" aria-label="Add to cart">
                  <svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M37.6006 30.9731H12.9872L8.25391 12.0398H42.3339L37.6006 30.9731Z" fill="#FAEB30"/>
                    <path d="M3.51953 6.35986H6.83286L8.25286 12.0399M8.25286 12.0399L12.9862 30.9732H37.5995L42.3329 12.0399H8.25286Z" stroke="#FAEB30" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12.9845 40.4398C14.553 40.4398 15.8245 39.1683 15.8245 37.5998C15.8245 36.0313 14.553 34.7598 12.9845 34.7598C11.416 34.7598 10.1445 36.0313 10.1445 37.5998C10.1445 39.1683 11.416 40.4398 12.9845 40.4398Z" stroke="#FAEB30" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M37.5978 40.4398C39.1663 40.4398 40.4378 39.1683 40.4378 37.5998C40.4378 36.0313 39.1663 34.7598 37.5978 34.7598C36.0293 34.7598 34.7578 36.0313 34.7578 37.5998C34.7578 39.1683 36.0293 40.4398 37.5978 40.4398Z" stroke="#FAEB30" strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sauces-decorative-apple-bottom">
        <img src="https://api.builder.io/api/v1/image/assets/TEMP/cabd48ddcb0f09b9f73982e610f883762c93932b?width=588" alt="" />
      </div>

      <div className="sauces-decorative-rails">
        <div className="sauce-rail left">
          <svg width="629" height="29" viewBox="0 0 629 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 14.5C0 6.49187 6.49187 0 14.5 0H614.5C622.508 0 629 6.49187 629 14.5C629 22.5081 622.508 29 614.5 29H14.5C6.49186 29 0 22.5081 0 14.5Z" fill="#FFF200"/>
          </svg>
        </div>
        <div className="sauce-rail right">
          <svg width="612" height="31" viewBox="0 0 612 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 15.5C0 6.93959 6.93959 0 15.5 0H596.5C605.06 0 612 6.93959 612 15.5C612 24.0604 605.06 31 596.5 31H15.5C6.93958 31 0 24.0604 0 15.5Z" fill="#FFF200"/>
          </svg>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SaucePage
