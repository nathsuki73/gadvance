"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import img1 from "@/app/assets/img1.webp";
import img2 from "@/app/assets/img2.webp";
import img3 from "@/app/assets/img3.webp";
import img4 from "@/app/assets/img4.webp";
import img5 from "@/app/assets/img5.webp";

const images = [img1, img2, img3, img4, img5];

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  return (
    <div className="hidden md:block relative h-[650px] w-full max-w-[700px] md:h-[800px] md:max-w-[850px] overflow-hidden border-none outline-none shadow-none bg-white">
      {/* Images Container */}
      <div className="relative w-full h-full bg-white border-none outline-none">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out border-none ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            onTransitionEnd={() => setIsTransitioning(false)}
          >
            <Image
              src={images[index]}
              alt={`Slide ${index + 1}`}
              fill
              priority={index === 0}
              className={`object-contain border-none outline-none ${
                [1, 3, 4].includes(index) ? "scale-125" : ""
              }`}
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "bg-white w-3 h-3"
                : "bg-white/50 hover:bg-white/75 w-2 h-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
