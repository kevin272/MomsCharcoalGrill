import { Outlet, useLocation } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";


export default function AdminLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}

<div className={`fixed-top ${isHome ? 'header-home' : 'header-other'}`}>
<AdminHeader
  logo={"logo.png"}
  logoAlt="Company Logo"
  items={[
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blogs' }
  ]}
  activeHref="/"
  className="custom-nav"
  ease="power2.easeOut"
  baseColor="#000000"
  pillColor="#ffffff"
  hoveredPillTextColor="#ffffff"
  pillTextColor="#000000"
/>
</div>

      {/* Main content */}
<main className="flex-grow-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <AdminFooter />
    </div>
  );
}
