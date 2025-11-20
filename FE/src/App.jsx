import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';
import './index.css';
import MenuPage from './pages/MenuPage';
import Gallery from './pages/Gallery';
import Catering from './pages/Catering';
import HotDishes from './pages/HotDishes';
import CartPage from './pages/CartPage';
import Layout from './components/common/Layout';
import SaucePage from './pages/SaucePage';
import SauceDashboard from './pages/Dashboardpages/SauceDashboard';
import SauceForm from './pages/Dashboardpages/SauceForm';
import CateringOptionPage from './pages/CateringOptionPage';
import NotFound from './pages/NotFoundPage';
import AdminLayout from './components/Dashboard/AdminLayout';
import AdminDashboard from './pages/Dashboardpages/AdminDashboard';
import GalleryDashboard from './pages/Dashboardpages/GalleryDashboard';
import GalleryForm from './pages/Dashboardpages/GalleryForm';
import ContactDashboard from './pages/Dashboardpages/ContactDashboard';
import Login from './pages/Login';;
import MenuDashboard from './pages/Dashboardpages/MenuDashboard';
import MenuForm from './pages/Dashboardpages/MenuForm';
import OrderDashboard from './pages/Dashboardpages/OrderDashboard';
import CateringDashboard from './pages/Dashboardpages/CateringDashboard';
import CateringMenu from './components/CateringMenuItems';
import BannerDashboard from './pages/Dashboardpages/BannerDashboard';
import BannerForm from './pages/Dashboardpages/BannerForm';
import MenuSlidesDashboard from './pages/Dashboardpages/MenuSlidesDashboard';
import {ToastProvider}  from './components/common/ToastProvider';
import NoticeDashboard from './pages/Dashboardpages/NoticeDashboard';
import NoticeAe from './pages/Dashboardpages/NoticeAE';
import ScrollToTop from './components/ScrollToTop';
import Merchandise from './pages/Merchandise';


function App() {
  return (
    <>
                      <ScrollToTop behavior="auto"/>

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
          <Route path ="admin/catering" element= {<CateringDashboard/>}/>
          <Route path="/admin/banners" element={<BannerDashboard />} />
          <Route path="/admin/banners/new" element={<BannerForm />} />
          <Route path="/admin/banners/:id/edit" element={<BannerForm />} />
          <Route path="/admin/notices/" element={<NoticeDashboard />} />
          <Route path="/admin/notices/new" element={<NoticeAe />} />
          <Route path="/admin/notices/:id" element={<NoticeAe />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;
