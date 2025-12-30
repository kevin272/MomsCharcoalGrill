import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import NoticeBanner from "../NoticeBanner";

const Layout = ({ wrapperClass = "" }) => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" };

  return (
    <div className={`app-layout ${wrapperClass}`}>
      
      <NoticeBanner />

      <Header />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition }}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
