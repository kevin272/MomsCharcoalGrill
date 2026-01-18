import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

function Header() {
  const location = useLocation();
  const [isStuck, setIsStuck] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { items } = useCart();
  const cartSummary = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + (item.quantity || 1) * (Number(item.price) || 0),
      0
    );
    return {
      totalItems,
      totalPrice,
      formattedTotal: totalPrice ? `AUD ${totalPrice.toFixed(2)}` : 'AUD 0.00',
    };
  }, [items]);

  const headerRef = useRef(null);
  const navRef = useRef(null);
  const toggleBtnRef = useRef(null);

  const isActive = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');

  const toggleMobileNav = () => setMobileNavOpen((v) => !v);
  const closeMobileNav = () => setMobileNavOpen(false);

  // Close on route change
  useEffect(() => {
    closeMobileNav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close when clicking outside
  useEffect(() => {
    if (!mobileNavOpen) return;

    const handlePointerDown = (e) => {
      const navEl = navRef.current;
      const toggleEl = toggleBtnRef.current;
      if (!navEl || !toggleEl) return;

      const target = e.target;
      const clickInsideNav = navEl.contains(target);
      const clickOnToggle = toggleEl.contains(target);

      if (!clickInsideNav && !clickOnToggle) {
        closeMobileNav();
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') closeMobileNav();
    };

    document.addEventListener('mousedown', handlePointerDown, { passive: true });
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [mobileNavOpen]);

  // Close if resizing to desktop
  useEffect(() => {
    const BREAKPOINT = 1024; // match your CSS breakpoint
    const onResize = () => {
      if (window.innerWidth >= BREAKPOINT) closeMobileNav();
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sticky logic with hysteresis
  useEffect(() => {
    const cssOffset =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--stick-offset')) || 140;
    const TRIGGER = cssOffset;
    const HYSTERESIS = 60;
    let ticking = false;

    const evaluate = (y) => {
      setIsStuck((prev) => {
        if (prev) return y > TRIGGER - HYSTERESIS; // unstick only well below threshold
        return y > TRIGGER + HYSTERESIS; // stick only well above threshold
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
          ref={toggleBtnRef}
          className="mobile-nav-toggle"
          onClick={toggleMobileNav}
          aria-label="Toggle navigation"
          aria-expanded={mobileNavOpen}
          aria-controls="site-navigation"
        >
          ☰
        </button>

        {/* Backdrop for outside clicks on mobile */}
        {mobileNavOpen && <div className="nav-backdrop" aria-hidden="true"></div>}

        <nav
          id="site-navigation"
          ref={navRef}
          className={`navigation ${mobileNavOpen ? 'active' : ''}`}
          role="navigation"
        >
          <Link to="/" className={isActive('/')} onClick={closeMobileNav}>
            HOME
          </Link>
          <Link to="/catering" className={isActive('/catering')} onClick={closeMobileNav}>
            CATERING Menu
          </Link>
          <Link to="/menu" className={isActive('/menu')} onClick={closeMobileNav}>
            General Menu
          </Link>
          <Link to="/sauces" className="nav-link" onClick={closeMobileNav}>
            SAUCES
          </Link>
          <Link to="/gallery" className={isActive('/gallery')} onClick={closeMobileNav}>
            GALLERY
          </Link>
          <Link to="/merchandise" className="nav-link" onClick={closeMobileNav}>
            MERCHANDISE
          </Link>

        </nav>

        <Link to="/cart" className="cart-icon" aria-label={`Cart with ${cartSummary.totalItems} items`}>
          <div className="cart-icon-badge">
            <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M46.5974 38.2117H15.8307L9.91406 14.545H52.5141L46.5974 38.2117Z" fill="#FAEB30" />
              <path d="M3.99609 7.44507H8.13776L9.91276 14.5451M9.91276 14.5451L15.8294 38.2117H46.5961L52.5128 14.5451H9.91276Z" stroke="#FAEB30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.8312 50.0451C17.7919 50.0451 19.3812 48.4557 19.3812 46.4951C19.3812 44.5345 17.7919 42.9451 15.8312 42.9451C13.8706 42.9451 12.2812 44.5345 12.2812 46.4951C12.2812 48.4557 13.8706 50.0451 15.8312 50.0451Z" stroke="#FAEB30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M46.5969 50.0451C48.5575 50.0451 50.1469 48.4557 50.1469 46.4951C50.1469 44.5345 48.5575 42.9451 46.5969 42.9451C44.6363 42.9451 43.0469 44.5345 43.0469 46.4951C43.0469 48.4557 44.6363 50.0451 46.5969 50.0451Z" stroke="#FAEB30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="cart-count" aria-live="polite">
              {cartSummary.totalItems}
            </span>
          </div>
          <span className="cart-total" aria-hidden="true">{cartSummary.formattedTotal}</span>
        </Link>
      </div>

      <div className="contact-info">
        <p>
          Old Maryborough Rd, Pialba QLD 4655 ·
          <a href="tel:+61741942975">(+61) 7 4194 2975</a>
        </p>

      </div>
    </header>
  );
}

export default Header;
