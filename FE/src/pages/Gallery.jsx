import React, { useState } from 'react'
import Breadcrumb from '../components/CateringHero'

const Gallery = () => {
  const [currentPage, setCurrentPage] = useState(0)
  
  // Sample gallery images - in a real app, these would come from an API
  const galleryImages = [
    // Page 1 images (20 images)
    [
      'https://api.builder.io/api/v1/image/assets/TEMP/09650d06d645361171a1767c2bee7bf73dc887d7?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/bd032d068ae6f42109b21b28056baaa211c2e335?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/f0ebe7ae9c693756a64926e34f3069beaa7f493c?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/8f895ef64a8bf2312af8fcc9119667959032f87a?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/34e30526e97a593055cb038ac758060b4a321169?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/825ba62cd2edb9d2ae5b54fddbd29267a5a7dc7d?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/bae1065a77c890cc7fe51c9238ff1415c0e193ae?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/f90672cbac0a276ff97b4f5a58ef142a48dce998?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/f28fd415b23a82891aa6c9e8841e2218c62e27e7?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/4482f04f89cf11c694558751693855e5b9cea3ad?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/71f5d3f38ad529c43582c5cf701c152d2866db8a?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/c10c3f9efea3ea9510684f581fc7dbd284105777?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/ecd9925c9a33c28c667bf8c487d5c1feca860d7b?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/5fecb88c0f090d01b6fd1afb18cc6b81322f28e0?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/9d50455e006c4eba01f351b0dabc60eea95f8042?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/7bba23d7edecfe99a8530fed8427d5450d5a568b?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/a1da39acb6cee399b145295a411c7e6aa0b2d0f6?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/51c40f29ab9a104536ce9f34e1dedbb47d069f55?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/b2b27d531db22bcffa9d1e46111a2286d88827b1?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/aaeaaf2d3dd812aa8ed0b2fe06e399db4bd6d7d4?width=566'
    ],
    // Page 2 images (20 more images - duplicated for demo)
    [
      'https://api.builder.io/api/v1/image/assets/TEMP/09650d06d645361171a1767c2bee7bf73dc887d7?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/bd032d068ae6f42109b21b28056baaa211c2e335?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/f0ebe7ae9c693756a64926e34f3069beaa7f493c?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/8f895ef64a8bf2312af8fcc9119667959032f87a?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/34e30526e97a593055cb038ac758060b4a321169?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/825ba62cd2edb9d2ae5b54fddbd29267a5a7dc7d?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/bae1065a77c890cc7fe51c9238ff1415c0e193ae?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/f90672cbac0a276ff97b4f5a58ef142a48dce998?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/f28fd415b23a82891aa6c9e8841e2218c62e27e7?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/4482f04f89cf11c694558751693855e5b9cea3ad?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/71f5d3f38ad529c43582c5cf701c152d2866db8a?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/c10c3f9efea3ea9510684f581fc7dbd284105777?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/ecd9925c9a33c28c667bf8c487d5c1feca860d7b?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/5fecb88c0f090d01b6fd1afb18cc6b81322f28e0?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/9d50455e006c4eba01f351b0dabc60eea95f8042?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/7bba23d7edecfe99a8530fed8427d5450d5a568b?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/a1da39acb6cee399b145295a411c7e6aa0b2d0f6?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/51c40f29ab9a104536ce9f34e1dedbb47d069f55?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/b2b27d531db22bcffa9d1e46111a2286d88827b1?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/aaeaaf2d3dd812aa8ed0b2fe06e399db4bd6d7d4?width=566'
    ],
    // Page 3 images
    [
      'https://api.builder.io/api/v1/image/assets/TEMP/f0ebe7ae9c693756a64926e34f3069beaa7f493c?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/8f895ef64a8bf2312af8fcc9119667959032f87a?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/34e30526e97a593055cb038ac758060b4a321169?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/825ba62cd2edb9d2ae5b54fddbd29267a5a7dc7d?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/bae1065a77c890cc7fe51c9238ff1415c0e193ae?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/f90672cbac0a276ff97b4f5a58ef142a48dce998?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/f28fd415b23a82891aa6c9e8841e2218c62e27e7?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/4482f04f89cf11c694558751693855e5b9cea3ad?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/71f5d3f38ad529c43582c5cf701c152d2866db8a?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/c10c3f9efea3ea9510684f581fc7dbd284105777?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/ecd9925c9a33c28c667bf8c487d5c1feca860d7b?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/5fecb88c0f090d01b6fd1afb18cc6b81322f28e0?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/9d50455e006c4eba01f351b0dabc60eea95f8042?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/7bba23d7edecfe99a8530fed8427d5450d5a568b?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/a1da39acb6cee399b145295a411c7e6aa0b2d0f6?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/51c40f29ab9a104536ce9f34e1dedbb47d069f55?width=564',
      'https://api.builder.io/api/v1/image/assets/TEMP/b2b27d531db22bcffa9d1e46111a2286d88827b1?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/aaeaaf2d3dd812aa8ed0b2fe06e399db4bd6d7d4?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/09650d06d645361171a1767c2bee7bf73dc887d7?width=566',
      'https://api.builder.io/api/v1/image/assets/TEMP/bd032d068ae6f42109b21b28056baaa211c2e335?width=564'
    ]
  ]

  const currentImages = galleryImages[currentPage] || galleryImages[0]
  const totalPages = galleryImages.length

  const handlePrevPage = () => {
    setCurrentPage(prev => prev > 0 ? prev - 1 : totalPages - 1)
  }

  const handleNextPage = () => {
    setCurrentPage(prev => prev < totalPages - 1 ? prev + 1 : 0)
  }

  const handleDotClick = (pageIndex) => {
    setCurrentPage(pageIndex)
  }

  return (
    <div className="gallery-page">
            <Breadcrumb title="Gallery" backgroundImage="https://api.builder.io/api/v1/image/assets/TEMP/8f3784c8c4f948c9b9545fa1d56598510743f14c?width=3456"/>

      {/* Gallery Grid Section */}
      <section className="gallery-grid-section">
        <div className="gallery-container">
          {/* Left Navigation Arrow */}
          <button className="gallery-nav-arrow gallery-nav-left" onClick={handlePrevPage} aria-label="Previous page">
            <svg width="79" height="40" viewBox="0 0 79 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_1_451" fill="white">
                <path d="M17.2671 0.0556641L0 9.53243L17.2671 19.0299L22.5714 16.098L10.6086 9.53243L22.5714 2.96683L17.2671 0.0556641ZM39.1614 0.0556641L33.8571 2.96683L45.82 9.53243L33.8571 16.098L39.1614 19.0299L56.4286 9.53243L39.1614 0.0556641ZM73.6957 16.9445L43.2619 33.6476L29.4557 26.0497L24.1514 28.9608L43.2619 39.4699L79 19.8557L73.6957 16.9445Z"/>
              </mask>
              <path d="M17.2671 0.0556641L0 9.53243L17.2671 19.0299L22.5714 16.098L10.6086 9.53243L22.5714 2.96683L17.2671 0.0556641ZM39.1614 0.0556641L33.8571 2.96683L45.82 9.53243L33.8571 16.098L39.1614 19.0299L56.4286 9.53243L39.1614 0.0556641ZM73.6957 16.9445L43.2619 33.6476L29.4557 26.0497L24.1514 28.9608L43.2619 39.4699L79 19.8557L73.6957 16.9445Z" fill="black"/>
              <path d="M17.2671 0.0556641L25.4464 -14.8473L17.2671 -19.3364L9.08789 -14.8473L17.2671 0.0556641ZM0 9.53243L-8.17926 -5.37058L-35.3037 9.51622L-8.19294 24.4279L0 9.53243ZM17.2671 19.0299L9.0742 33.9253L17.2872 38.4427L25.4909 33.9084L17.2671 19.0299ZM22.5714 16.098L30.7952 30.9766L57.8088 16.0454L30.7507 1.19503L22.5714 16.098ZM10.6086 9.53243L2.42931 -5.37058L-24.7247 9.53244L2.42931 24.4354L10.6086 9.53243ZM22.5714 2.96683L30.7507 17.8698L57.9047 2.96683L30.7507 -11.9362L22.5714 2.96683ZM39.1614 0.0556641L47.3407 -14.8473L39.1614 -19.3364L30.9822 -14.8473L39.1614 0.0556641ZM33.8571 2.96683L25.6779 -11.9362L-1.47614 2.96683L25.6779 17.8698L33.8571 2.96683ZM45.82 9.53243L53.9993 24.4354L81.1533 9.53244L53.9993 -5.37058L45.82 9.53243ZM33.8571 16.098L25.6779 1.19503L-1.38026 16.0454L25.6334 30.9766L33.8571 16.098ZM39.1614 19.0299L30.9377 33.9084L39.1414 38.4427L47.3544 33.9253L39.1614 19.0299ZM56.4286 9.53243L64.6215 24.4279L91.7323 9.51622L64.6078 -5.37058L56.4286 9.53243ZM73.6957 16.9445L81.875 2.04154L73.6957 -2.4475L65.5165 2.04154L73.6957 16.9445ZM43.2619 33.6476L35.0655 48.5412L43.2508 53.0458L51.4412 48.5506L43.2619 33.6476ZM29.4557 26.0497L37.6521 11.1561L29.4669 6.65151L21.2765 11.1467L29.4557 26.0497ZM24.1514 28.9608L15.9722 14.0578L-11.1552 28.9462L15.9598 43.8571L24.1514 28.9608ZM43.2619 39.4699L35.0703 54.3662L43.2539 58.8664L51.4412 54.373L43.2619 39.4699ZM79 19.8557L87.1793 34.7587L114.333 19.8557L87.1793 4.9527L79 19.8557ZM17.2671 0.0556641L9.08789 -14.8473L-8.17926 -5.37058L0 9.53243L8.17926 24.4354L25.4464 14.9587L17.2671 0.0556641ZM0 9.53243L-8.19294 24.4279L9.0742 33.9253L17.2671 19.0299L25.4601 4.13436L8.19294 -5.36306L0 9.53243ZM17.2671 19.0299L25.4909 33.9084L30.7952 30.9766L22.5714 16.098L14.3477 1.21952L9.04341 4.15133L17.2671 19.0299ZM22.5714 16.098L30.7507 1.19503L18.7878 -5.37058L10.6086 9.53243L2.42931 24.4354L14.3922 31.0011L22.5714 16.098ZM10.6086 9.53243L18.7878 24.4354L30.7507 17.8698L22.5714 2.96683L14.3922 -11.9362L2.42931 -5.37058L10.6086 9.53243ZM22.5714 2.96683L30.7507 -11.9362L25.4464 -14.8473L17.2671 0.0556641L9.08788 14.9587L14.3922 17.8698L22.5714 2.96683ZM39.1614 0.0556641L30.9822 -14.8473L25.6779 -11.9362L33.8571 2.96683L42.0364 17.8698L47.3407 14.9587L39.1614 0.0556641ZM33.8571 2.96683L25.6779 17.8698L37.6407 24.4354L45.82 9.53243L53.9993 -5.37058L42.0364 -11.9362L33.8571 2.96683ZM45.82 9.53243L37.6407 -5.37058L25.6779 1.19503L33.8571 16.098L42.0364 31.0011L53.9993 24.4354L45.82 9.53243ZM33.8571 16.098L25.6334 30.9766L30.9377 33.9084L39.1614 19.0299L47.3852 4.15133L42.0809 1.21952L33.8571 16.098ZM39.1614 19.0299L47.3544 33.9253L64.6215 24.4279L56.4286 9.53243L48.2356 -5.36306L30.9685 4.13436L39.1614 19.0299ZM56.4286 9.53243L64.6078 -5.37058L47.3407 -14.8473L39.1614 0.0556641L30.9822 14.9587L48.2493 24.4354L56.4286 9.53243ZM73.6957 16.9445L65.5165 2.04154L35.0826 18.7446L43.2619 33.6476L51.4412 48.5506L81.875 31.8476L73.6957 16.9445ZM43.2619 33.6476L51.4583 18.754L37.6521 11.1561L29.4557 26.0497L21.2593 40.9433L35.0655 48.5412L43.2619 33.6476ZM29.4557 26.0497L21.2765 11.1467L15.9722 14.0578L24.1514 28.9608L32.3307 43.8639L37.635 40.9527L29.4557 26.0497ZM24.1514 28.9608L15.9598 43.8571L35.0703 54.3662L43.2619 39.4699L51.4535 24.5737L32.3431 14.0646L24.1514 28.9608ZM43.2619 39.4699L51.4412 54.373L87.1793 34.7587L79 19.8557L70.8207 4.9527L35.0826 24.5669L43.2619 39.4699ZM79 19.8557L87.1793 4.9527L81.875 2.04154L73.6957 16.9445L65.5165 31.8476L70.8207 34.7587L79 19.8557Z" fill="black" mask="url(#path-1-inside-1_1_451)"/>
            </svg>
          </button>

          {/* Gallery Grid */}
          <div className="gallery-grid">
            {currentImages.map((image, index) => (
              <div key={index} className="gallery-image-container">
                <img src={image} alt={`Gallery image ${index + 1}`} className="gallery-image" />
              </div>
            ))}
          </div>

          {/* Right Navigation Arrow */}
          <button className="gallery-nav-arrow gallery-nav-right" onClick={handleNextPage} aria-label="Next page">
            <svg width="79" height="41" viewBox="0 0 79 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_1_469" fill="white">
                <path d="M17.2671 0.0881348L0 9.8817L17.2671 19.6966L22.5714 16.6668L10.6086 9.8817L22.5714 3.09662L17.2671 0.0881348ZM39.1614 0.0881348L33.8571 3.09662L45.82 9.8817L33.8571 16.6668L39.1614 19.6966L56.4286 9.8817L39.1614 0.0881348ZM73.6957 17.5416L43.2619 34.803L29.4557 26.9511L24.1514 29.9596L43.2619 40.82L79 20.5501L73.6957 17.5416Z"/>
              </mask>
              <path d="M17.2671 0.0881348L0 9.8817L17.2671 19.6966L22.5714 16.6668L10.6086 9.8817L22.5714 3.09662L17.2671 0.0881348ZM39.1614 0.0881348L33.8571 3.09662L45.82 9.8817L33.8571 16.6668L39.1614 19.6966L56.4286 9.8817L39.1614 0.0881348ZM73.6957 17.5416L43.2619 34.803L29.4557 26.9511L24.1514 29.9596L43.2619 40.82L79 20.5501L73.6957 17.5416Z" fill="black"/>
              <path d="M17.2671 0.0881348L25.6541 -14.699L17.2671 -19.4559L8.88019 -14.699L17.2671 0.0881348ZM0 9.8817L-8.38695 -4.90542L-34.4299 9.86561L-8.40076 24.661L0 9.8817ZM17.2671 19.6966L8.86638 34.4759L17.2877 39.2627L25.699 34.4582L17.2671 19.6966ZM22.5714 16.6668L31.0033 31.4284L56.9377 16.6146L30.9584 1.87966L22.5714 16.6668ZM10.6086 9.8817L2.22162 -4.90542L-23.8497 9.8817L2.22162 24.6688L10.6086 9.8817ZM22.5714 3.09662L30.9584 17.8837L57.0297 3.09662L30.9584 -11.6905L22.5714 3.09662ZM39.1614 0.0881348L47.5484 -14.699L39.1614 -19.4559L30.7745 -14.699L39.1614 0.0881348ZM33.8571 3.09662L25.4702 -11.6905L-0.601148 3.09662L25.4702 17.8837L33.8571 3.09662ZM45.82 9.8817L54.207 24.6688L80.2783 9.8817L54.207 -4.90542L45.82 9.8817ZM33.8571 16.6668L25.4702 1.87966L-0.509102 16.6146L25.4253 31.4284L33.8571 16.6668ZM39.1614 19.6966L30.7296 34.4582L39.1408 39.2627L47.5622 34.4759L39.1614 19.6966ZM56.4286 9.8817L64.8293 24.661L90.8585 9.86561L64.8155 -4.90542L56.4286 9.8817ZM73.6957 17.5416L82.0827 2.75447L73.6957 -2.00244L65.3088 2.75447L73.6957 17.5416ZM43.2619 34.803L34.8577 49.5803L43.2505 54.3535L51.6489 49.5901L43.2619 34.803ZM29.4557 26.9511L37.8599 12.1738L29.4671 7.40059L21.0688 12.164L29.4557 26.9511ZM24.1514 29.9596L15.7645 15.1725L-10.2812 29.945L15.752 44.7396L24.1514 29.9596ZM43.2619 40.82L34.8625 55.6L43.2537 60.3687L51.6489 55.6071L43.2619 40.82ZM79 20.5501L87.3869 35.3372L113.458 20.5501L87.3869 5.76295L79 20.5501ZM17.2671 0.0881348L8.88019 -14.699L-8.38695 -4.90542L0 9.8817L8.38695 24.6688L25.6541 14.8753L17.2671 0.0881348ZM0 9.8817L-8.40076 24.661L8.86638 34.4759L17.2671 19.6966L25.6679 4.91732L8.40076 -4.89758L0 9.8817ZM17.2671 19.6966L25.699 34.4582L31.0033 31.4284L22.5714 16.6668L14.1396 1.90521L8.8353 4.93503L17.2671 19.6966ZM22.5714 16.6668L30.9584 1.87966L18.9955 -4.90542L10.6086 9.8817L2.22162 24.6688L14.1845 31.4539L22.5714 16.6668ZM10.6086 9.8817L18.9955 24.6688L30.9584 17.8837L22.5714 3.09662L14.1845 -11.6905L2.22162 -4.90542L10.6086 9.8817ZM22.5714 3.09662L30.9584 -11.6905L25.6541 -14.699L17.2671 0.0881348L8.88019 14.8753L14.1845 17.8837L22.5714 3.09662ZM39.1614 0.0881348L30.7745 -14.699L25.4702 -11.6905L33.8571 3.09662L42.2441 17.8837L47.5484 14.8753L39.1614 0.0881348ZM33.8571 3.09662L25.4702 17.8837L37.4331 24.6688L45.82 9.8817L54.207 -4.90542L42.2441 -11.6905L33.8571 3.09662ZM45.82 9.8817L37.4331 -4.90542L25.4702 1.87966L33.8571 16.6668L42.2441 31.4539L54.207 24.6688L45.82 9.8817ZM33.8571 16.6668L25.4253 31.4284L30.7296 34.4582L39.1614 19.6966L47.5933 4.93503L42.289 1.90521L33.8571 16.6668ZM39.1614 19.6966L47.5622 34.4759L64.8293 24.661L56.4286 9.8817L48.0278 -4.89758L30.7607 4.91732L39.1614 19.6966ZM56.4286 9.8817L64.8155 -4.90542L47.5484 -14.699L39.1614 0.0881348L30.7745 14.8753L48.0416 24.6688L56.4286 9.8817ZM73.6957 17.5416L65.3088 2.75447L34.875 20.0159L43.2619 34.803L51.6489 49.5901L82.0827 32.3287L73.6957 17.5416ZM43.2619 34.803L51.6661 20.0257L37.8599 12.1738L29.4557 26.9511L21.0515 41.7284L34.8577 49.5803L43.2619 34.803ZM29.4557 26.9511L21.0688 12.164L15.7645 15.1725L24.1514 29.9596L32.5384 44.7467L37.8427 41.7382L29.4557 26.9511ZM24.1514 29.9596L15.752 44.7396L34.8625 55.6L43.2619 40.82L51.6613 26.0399L32.5509 15.1795L24.1514 29.9596ZM43.2619 40.82L51.6489 55.6071L87.3869 35.3372L79 20.5501L70.6131 5.76295L34.875 26.0329L43.2619 40.82ZM79 20.5501L87.3869 5.76295L82.0827 2.75447L73.6957 17.5416L65.3088 32.3287L70.6131 35.3372L79 20.5501Z" fill="black" mask="url(#path-1-inside-1_1_469)"/>
            </svg>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="gallery-pagination">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              className={`gallery-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </section>

    </div>
  )
}

export default Gallery
