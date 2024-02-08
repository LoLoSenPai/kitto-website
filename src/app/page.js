'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const images = ["/images/sneakpeek-1.png", "/images/sneakpeek-2.png", "/images/sneakpeek-3.png"];
  const backgrounds = ["/images/Background-1.png", "/images/Background-2.png", "/images/Background-3.png"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    document.body.style.backgroundImage = `url(${backgrounds[currentIndex]})`;
    document.body.style.transition = 'background-image 0.5s ease-in-out';

    return () => {
      document.body.style.backgroundImage = '';
    };
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="flex items-center justify-center w-full space-x-4 md:space-x-10 lg:space-x-20">
        <button onClick={goToPrevious} className="prev-button w-[120px] h-auto mt-28">
          <Image src="/images/left-arrow.png" width={120} height={100} alt="Previous" />
        </button>
        <div className="flex flex-col items-center justify-center w-[360px] h-auto">
          <Image src={images[currentIndex]} width={420} height={420} alt="Sneak Peek" />
        </div>
        <button onClick={goToNext} className="next-button w-[120px] h-auto mt-28">
          <Image src="/images/right-arrow.png" width={120} height={100} alt="Next" />
        </button>
      </div>
      <div className="flex items-center justify-center md:w-[500px] h-auto">
        <Image src="/images/bottom-bar.png" width={500} height={100} alt="Bottom Bar" />
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
