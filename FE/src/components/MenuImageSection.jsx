import React from "react";
import ImageCarousel from "./ImageCarousel";

function MenuImageSection() {
  return (
    <section className="menu-content">
      <div className="menu-image">
        <ImageCarousel
          type="menu"
          autoplay
          interval={4500}
          className="menu-page-carousel"
          showPreviewButton
        />
      </div>
    </section>
  );
}

export default MenuImageSection;

// ---------- DOWNLOAD BUTTON ----------
export function DownloadMenuButton() {
  const fileUrl = `./Menu.pdf`;

  const handleDownload = () => {
    // open directly, letting browser download or preview PDF
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "MomsCharcoal_Menu.pdf"; // force download name
    a.target = "_blank";
    a.click();
  };

  return (
    <section className="download-section" style={{ textAlign: "center", marginTop: "2rem" }}>
      <button
        className="download-button"
        onClick={handleDownload}
        style={{
          background: "#FFF200",
          color: "#000",
          padding: "14px 24px",
          fontWeight: 600,
          borderRadius: 6,
          cursor: "pointer",
          border: "none",
        }}
      >
        Click here to download menu
      </button>
    </section>
  );
}
