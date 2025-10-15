import React from "react";
import ImageCarousel from "./ImageCarousel";
const fileUrl = `./Menu.pdf`;

  const handleDownload = () => {
    // open directly, letting browser download or preview PDF
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "MomsCharcoal_Menu.pdf"; // force download name
    a.target = "_blank";
    a.click();
  }
const CateringMenu = () => {
  return (
    <section className="catering-menu-section">
      <div className="container">
        <h2 className="catering-menu-title">OUR CATERING MENU</h2>

        <div className="catering-menu-image-container">
          <ImageCarousel type="cateringmenu" autoplay interval={4500} className="catering-menu-carousel" />
        </div>

        <div className="catering-download-section">
          <button className="catering-download-btn"         onClick={handleDownload}
>Click here to download menu</button>
        </div>
      </div>
    </section>
  );
};

export default CateringMenu;
