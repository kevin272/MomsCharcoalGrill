import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import './index.css';
import Layout from './components/common/Layout';
import AdminLayout from './components/Dashboard/AdminLayout';
import { ToastProvider } from './components/common/ToastProvider';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Catering = lazy(() => import('./pages/Catering'));
const HotDishes = lazy(() => import('./pages/HotDishes'));
const CartPage = lazy(() => import('./pages/CartPage'));
const SaucePage = lazy(() => import('./pages/SaucePage'));
const SauceDashboard = lazy(() => import('./pages/Dashboardpages/SauceDashboard'));
const SauceForm = lazy(() => import('./pages/Dashboardpages/SauceForm'));
const CateringOptionPage = lazy(() => import('./pages/CateringOptionPage'));
const NotFound = lazy(() => import('./pages/NotFoundPage'));
const AdminDashboard = lazy(() => import('./pages/Dashboardpages/AdminDashboard'));
const GalleryDashboard = lazy(() => import('./pages/Dashboardpages/GalleryDashboard'));
const GalleryForm = lazy(() => import('./pages/Dashboardpages/GalleryForm'));
const ContactDashboard = lazy(() => import('./pages/Dashboardpages/ContactDashboard'));
const Login = lazy(() => import('./pages/Login'));
const MenuDashboard = lazy(() => import('./pages/Dashboardpages/MenuDashboard'));
const MenuForm = lazy(() => import('./pages/Dashboardpages/MenuForm'));
const OrderDashboard = lazy(() => import('./pages/Dashboardpages/OrderDashboard'));
const CateringDashboard = lazy(() => import('./pages/Dashboardpages/CateringDashboard'));
const CateringMenu = lazy(() => import('./components/CateringMenuItems'));
const BannerDashboard = lazy(() => import('./pages/Dashboardpages/BannerDashboard'));
const BannerForm = lazy(() => import('./pages/Dashboardpages/BannerForm'));
const MenuSlidesDashboard = lazy(() => import('./pages/Dashboardpages/MenuSlidesDashboard'));
const NoticeDashboard = lazy(() => import('./pages/Dashboardpages/NoticeDashboard'));
const NoticeAe = lazy(() => import('./pages/Dashboardpages/NoticeAE'));
const Merchandise = lazy(() => import('./pages/Merchandise'));
const PromoSettings = lazy(() => import('./pages/Dashboardpages/PromoSettings'));
const DeliverySettings = lazy(() => import('./pages/Dashboardpages/DeliverySettings'));

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#000',
    color: '#FAEB30',
    fontFamily: 'Big Shoulders Stencil Text, sans-serif',
    fontSize: '2rem'
  }}>
    LOADING...
  </div>
);


function App() {
  return (
    <>
      <ScrollToTop behavior="smooth" />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/catering" element={<Catering />} />
            <Route path="/catering/package/:optionId" element={<CateringMenu />} />

            {/* Specific catering routes: hot dishes and option menus must be declared before the generic :optionId */}
            <Route path="/catering/hot-dishes" element={<HotDishes />} />
            <Route path="/catering/:optionId" element={<CateringOptionPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/sauces" element={<SaucePage />} />
            <Route path="/merchandise" element={<Merchandise />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/gallery" element={<GalleryDashboard />} />
            <Route path="/admin/gallery/add" element={<GalleryForm />} />
            <Route path="/admin/contact" element={<ContactDashboard />} />
            <Route path="/admin/menu" element={<MenuDashboard />} />
            <Route path="/admin/menu/new" element={<MenuForm />} />
            <Route path="/admin/menu/:id/edit" element={<MenuForm />} />
            <Route path="/admin/menu-slides" element={<MenuSlidesDashboard />} />

            {/* New orders dashboard route */}
            <Route path="/admin/order" element={<OrderDashboard />} />
            {/* Sauce dashboard and CRUD routes */}
            <Route path="/admin/sauces" element={<SauceDashboard />} />
            <Route path="/admin/sauces/new" element={<SauceForm />} />
            <Route path="/admin/sauces/:id/edit" element={<SauceForm />} />
            <Route path="admin/catering" element={<CateringDashboard />} />
            <Route path="/admin/banners" element={<BannerDashboard />} />
            <Route path="/admin/banners/new" element={<BannerForm />} />
            <Route path="/admin/banners/:id/edit" element={<BannerForm />} />
            <Route path="/admin/notices/" element={<NoticeDashboard />} />
            <Route path="/admin/notices/new" element={<NoticeAe />} />
            <Route path="/admin/notices/:id" element={<NoticeAe />} />
            <Route path="/admin/promo" element={<PromoSettings />} />
            <Route path="/admin/settings/delivery" element={<DeliverySettings />} />

          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
