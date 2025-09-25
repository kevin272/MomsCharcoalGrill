import React from "react";

const Breadcrumb = ({
  title,
  backgroundImage,
  alt = `${title} background`,
  children,
}) => {
  return (
    <section className="catering-hero">
      <div className="catering-hero-background">
        <img src={backgroundImage} alt={alt} />
      </div>
      <div className="catering-hero-overlay"></div>
      <div className="catering-hero-content">
        <h1 className="catering-title">{title}</h1>
        {children}
      </div>
    </section>
  );
};

export default Breadcrumb;
