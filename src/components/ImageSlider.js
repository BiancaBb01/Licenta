import { useState, useEffect } from "react";
import "../css/ImageSlider.css";
import foto1 from "../images/foto3.jpg";
import foto2 from "../images/fundal.jpg";
import foto3 from "../images/foto5.jpg";
import foto4 from "../images/lentils.jpg";
import foto5 from "../images/foto4.jpg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; 

const images = [foto1, foto2, foto3, foto4, foto5];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Schimbă imaginea la fiecare 5 secunde

    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsSliding(false);
    }, 600);
  };

  const prevSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setIsSliding(false);
    }, 600);
  };

  return (
    <div className="slider">
      <button className="slider-btn left" onClick={prevSlide}>
        <FaChevronLeft />
      </button>

      <div className="slider-images">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`slide-${index}`}
            className={`slider-image ${index === currentIndex ? "active" : ""}`}
          />
        ))}
      </div>

      <button className="slider-btn right" onClick={nextSlide}>
        <FaChevronRight />
      </button>

      <div className="dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
