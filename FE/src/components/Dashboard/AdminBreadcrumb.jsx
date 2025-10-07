import React from "react";
import { Link } from "react-router-dom"; // use Link if you're using React Router

const Breadcrumb = ({ title, links =[] }) => {
  return (
    <div className="rts-bread-crumb-area bg_image bg-breadcrumb">
      <div className="container ptb--65">
        <div className="row">
          <div className="col-lg-12">
            <div className="con-tent-main">
              <div className="wrapper">
                {/* Background Text */}
                <span className="bg-text-stok">{title}</span>

                {/* Title */}
                <div className="title skew-up">
                  <a href="#">{title}</a>
                </div>

                {/* Breadcrumb Links */}
                <div className="slug skew-up">
                  {links.map((link, index) => (
                    <span key={index}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className={link.active ? "active" : ""}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span className={link.active ? "active" : ""}>
                          {link.label}
                        </span>
                      )}
                      {index < links.length - 1 && " / "}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
