import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>404</h1>
      <p style={{ marginBottom: "20px" }}>Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" style={{ color: "#007bff", textDecoration: "underline" }}>
        Go back Home
      </Link>
    </div>
  );
}

export default NotFound;
