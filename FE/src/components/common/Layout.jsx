// src/layout/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import NoticeBanner from "../NoticeBanner";

const Layout = ({ wrapperClass = "" }) => {
  return (
    <div className={`app-layout ${wrapperClass}`}>
      
      <NoticeBanner />

      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
