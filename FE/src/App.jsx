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
import ProjectDashboard from './pages/Dashboardpages/ProjectDashboard';
import ContactDashboard from './pages/Dashboardpages/ContactDashboard';
import Login from './pages/Login';;
import { Toaster } from 'react-hot-toast';
import MenuDashboard from './pages/Dashboardpages/MenuDashboard';
import MenuForm from './pages/Dashboardpages/MenuForm';
import OrderDashboard from './pages/Dashboardpages/OrderDashboard';

function App() {
  return (
    <>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/catering" element={<Catering />} />
          {/* Specific catering routes: hot dishes and option menus must be declared before the generic :optionId */}
          <Route path="/catering/hot-dishes" element={<HotDishes />} />
          <Route path="/catering/:optionId" element={<CateringOptionPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/sauces" element={<SaucePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/gallery" element={<GalleryDashboard />} />
          <Route path="/admin/gallery/add" element={<GalleryForm />} />
          <Route path="/admin/projects" element={<ProjectDashboard />} />
          <Route path="/admin/contact" element={<ContactDashboard />} />
          <Route path="/admin/menu" element={<MenuDashboard />} />
          <Route path="/admin/menu/new" element={<MenuForm />} />
          <Route path="/admin/menu/:id/edit" element={<MenuForm />} />
          {/* New orders dashboard route */}
          <Route path="/admin/order" element={<OrderDashboard />} />
          {/* Sauce dashboard and CRUD routes */}
          <Route path="/admin/sauces" element={<SauceDashboard />} />
          <Route path="/admin/sauces/new" element={<SauceForm />} />
          <Route path="/admin/sauces/:id/edit" element={<SauceForm />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;