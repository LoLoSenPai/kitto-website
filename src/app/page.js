'use client';

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const images = ["/images/sneakpeek-1.png", "/images/sneakpeek-2.png", "/images/sneakpeek-3.png", "/images/sneakpeek-4.png", "/images/sneakpeek-5.png"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24">
      <div className="flex items-center justify-center w-full space-x-20">
        <button onClick={goToPrevious}>
          <Image src="/images/left-arrow.png" width={120} height={100} alt="Previous" />
        </button>
        <div className="flex flex-col items-center justify-center">
          <Image src={images[currentIndex]} width={200} height={200} alt="Sneak Peek" />
        </div>
        <button onClick={goToNext}>
          <Image src="/images/right-arrow.png" width={120} height={100} alt="Next" />
        </button>
      </div>
      <div className="flex items-center justify-center">
        <Image src="/images/bottom-bar.png" width={450} height={80} alt="Bottom Bar" />
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
