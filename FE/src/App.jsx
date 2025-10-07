import { Box } from "@chakra-ui/react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import "./App.css"
import "./index.css";
import MenuPage from "./pages/MenuPage"
import Gallery from "./pages/Gallery"
import Catering from "./pages/Catering"
import HotDishes from "./pages/HotDishes"
import CartPage from "./pages/CartPage"
import Layout from "./components/common/Layout"
import SaucePage from "./pages/SaucePage"
import NotFound from "./pages/NotFoundPage"
import AdminLayout from "./components/Dashboard/AdminLayout";
import AdminDashboard from "./pages/Dashboardpages/AdminDashboard";
import GalleryDashboard from "./pages/Dashboardpages/GalleryDashboard";
import GalleryForm from "./pages/Dashboardpages/GalleryForm";
import ProjectForm from "./pages/Dashboardpages/ProjectForm";
import ProjectDashboard from "./pages/Dashboardpages/ProjectDashboard";
import ContactDashboard from "./pages/Dashboardpages/ContactDashboard";
import ProjectEdit from "./pages/Dashboardpages/ProjectEdit";
import Login from "./pages/Login";
import BlogDashboard from "./pages/Dashboardpages/BlogDashboard";
import BlogForm from "./pages/Dashboardpages/BlogForm";
import BlogEdit from "./pages/Dashboardpages/BlogEdit";
import { Toaster } from "react-hot-toast";
import MenuDashboard from "./pages/Dashboardpages/MenuDashboard";
import MenuForm from "./pages/Dashboardpages/MenuForm";
function App() {

  return (<>
  <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
      <Routes>
        <Route element = {<Layout/>}>
          <Route path="/" element = {<Home />}/>
          <Route path="/menu" element = {<MenuPage/>}/>
          <Route path="/gallery" element = {<Gallery/>}/>
          <Route path="/catering" element = {<Catering/>}/>
          <Route path="/catering/hot-dishes" element = {<HotDishes/>}/>
          <Route path="/cart" element = {<CartPage/>}/>
          <Route path="/sauces" element= {<SaucePage/>}/>
          <Route path="/login" element={<Login />} />


          <Route path="*" element={<NotFound />} />

        </Route>

        <Route element = {<AdminLayout/>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/gallery" element={<GalleryDashboard />} />
        <Route path="/admin/gallery/add" element={<GalleryForm />} />
        <Route path="/admin/projects" element={<ProjectDashboard />} />
        <Route path="/admin/contact" element={<ContactDashboard/>} />
        <Route path="/admin/menu" element={<MenuDashboard />} />
<Route path="/admin/menu/new" element={<MenuForm />} />
<Route path="/admin/menu/:id/edit" element={<MenuForm />} />
      </Route>
      </Routes>
      </>
  )
}

export default App
