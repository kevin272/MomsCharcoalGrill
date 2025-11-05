import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const [isStuck, setIsStuck] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const headerRef = useRef(null);

 const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen)
  }

  const closeMobileNav = () => {
    setMobileNavOpen(false)
  }


  useEffect(() => {
    const cssOffset = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--stick-offset')
    ) || 140;
    const TRIGGER = cssOffset; // keep in sync with CSS var
    const HYSTERESIS = 60; // px band to avoid flicker near threshold

    let ticking = false;

    const evaluate = (y) => {
      setIsStuck((prev) => {
        // When already stuck, only unstick well below the trigger.
        if (prev) return y > TRIGGER - HYSTERESIS;
        // When not stuck yet, only stick well above the trigger.
        return y > TRIGGER + HYSTERESIS;
      });
    };

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          evaluate(y);
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header ref={headerRef} className={`header ${isStuck ? 'is-stuck' : ''}`}>
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src="/Group 16.png" alt="Mom's Charcoal and Grill" />
          </Link>
        </div>

        <button
          className="mobile-nav-toggle"
          onClick={toggleMobileNav}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <nav className={`navigation ${mobileNavOpen ? 'active' : ''}`}>
          <Link
            to="/"
            className={isActive('/')}
            onClick={closeMobileNav}
          >
            HOME
          </Link>
          <Link
            to="/menu"
            className={isActive('/menu')}
            onClick={closeMobileNav}
          >
            MENU
          </Link>
          <a
            href="/sauces"
            className="nav-link"
            onClick={closeMobileNav}
          >
            SAUCES
          </a>
          <Link
            to="/gallery"
            className={isActive('/gallery')}
            onClick={closeMobileNav}
          >
            GALLERY
          </Link>
          <a
            href="/merchandise"
            className="nav-link"
            onClick={closeMobileNav}
          >
            MERCHANDISE
          </a>
          <Link
            to="/catering"
            className={isActive('/catering')}
            onClick={closeMobileNav}
          >
            CATERING
          </Link>
        </nav>

        <Link to="/cart" className="cart-icon">
          <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M46.5974 38.2117H15.8307L9.91406 14.545H52.5141L46.5974 38.2117Z" fill="#FAEB30"/>
            <path d="M3.99609 7.44507H8.13776L9.91276 14.5451M9.91276 14.5451L15.8294 38.2117H46.5961L52.5128 14.5451H9.91276Z" stroke="#FAEB30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.8312 50.0451C17.7919 50.0451 19.3812 48.4557 19.3812 46.4951C19.3812 44.5345 17.7919 42.9451 15.8312 42.9451C13.8706 42.9451 12.2812 44.5345 12.2812 46.4951C12.2812 48.4557 13.8706 50.0451 15.8312 50.0451Z" stroke="#FAEB30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M46.5969 50.0451C48.5575 50.0451 50.1469 48.4557 50.1469 46.4951C50.1469 44.5345 48.5575 42.9451 46.5969 42.9451C44.6363 42.9451 43.0469 44.5345 43.0469 46.4951C43.0469 48.4557 44.6363 50.0451 46.5969 50.0451Z" stroke="#FAEB30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      <div className="contact-info">
        <p>214 William Street, Earlwood, NSW <a href="tel:0297879055">(02) 9787 9055</a></p>
      </div>
    </header>
  )
}

export default Header
