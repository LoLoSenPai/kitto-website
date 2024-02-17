'use client';

import { useState, useEffect,useRef  } from "react";

export default function Home() {
  const images = ["/images/sneakpeek-1.webp", "/images/sneakpeek-2.webp", "/images/sneakpeek-3.webp", "/images/sneakpeek-4.webp", "/images/sneakpeek-5.webp"];
  const backgrounds = ["/images/Background-1.webp", "/images/Background-2.webp", "/images/Background-3.webp", "/images/Background-4.webp", "/images/Background-5.webp"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const backgroundRef = useRef();

  useEffect(() => {
    const preloadImages = [...backgrounds, ...images].map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.src = src;
      });
    });

    Promise.all(preloadImages).then(() => {
      console.log("All images were preloaded.");
    });
  }, []);

  useEffect(() => {
    if (backgroundRef.current) {
      backgroundRef.current.style.backgroundImage = `url(${backgrounds[currentIndex]})`;
      backgroundRef.current.style.transition = 'background-image 0.5s ease-in-out';
    }
  }, [currentIndex]);

  const simulateActiveEffect = (buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.add("simulate-active");
      setTimeout(() => button.classList.remove("simulate-active"), 150);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
    simulateActiveEffect("prev-button");
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
    simulateActiveEffect("next-button");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div ref={backgroundRef} className="fixed top-0 left-0 w-full h-full bg-center bg-no-repeat bg-cover" style={{ zIndex: -1 }}></div>
      <div className="flex items-center justify-center w-full space-x-4 md:space-x-10 lg:space-x-20">
        <button id="prev-button" onClick={goToPrevious} className="prev-button w-[120px] h-auto mt-28">
          <img src="/images/left-arrow.png" width={120} height={100} alt="Previous" />
        </button>
        <div className="flex flex-col items-center justify-center w-[420px] h-auto">
          <img src={images[currentIndex]} width={420} height={420} alt="Sneak Peek" />
        </div>
        <button id="next-button" onClick={goToNext} className="next-button w-[120px] h-auto mt-28">
          <img src="/images/right-arrow.png" width={120} height={100} alt="Next" />
        </button>
      </div>
      <div className="flex items-center justify-center md:w-[500px] h-auto">
        <img src="/images/bottom-bar.png" width={500} height={100} alt="Bottom Bar" />
      </div>
      <div className="flex items-center justify-center mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${currentIndex === index ? 'selected' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </main>
  );
}
