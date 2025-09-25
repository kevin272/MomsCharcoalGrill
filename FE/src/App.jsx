import { Box } from "@chakra-ui/react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import "./App.css"
import MenuPage from "./pages/MenuPage"
import Gallery from "./pages/Gallery"
import Catering from "./pages/Catering"
import HotDishes from "./pages/HotDishes"
import CartPage from "./pages/CartPage"
import Layout from "./components/common/Layout"

function App() {

  return (<>
      <Routes>
        <Route element = {<Layout/>}>
          <Route path="/" element = {<Home />}/>
          <Route path="/menu" element = {<MenuPage/>}/>
          <Route path="/gallery" element = {<Gallery/>}/>
          <Route path="/catering" element = {<Catering/>}/>
          <Route path="/catering/hot-dishes" element = {<HotDishes/>}/>
          <Route path="/cart" element = {<CartPage/>}/>
        </Route>
      </Routes>
      </>
  )
}

export default App
