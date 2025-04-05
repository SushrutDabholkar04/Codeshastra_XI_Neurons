'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const ImageGlider = () => {
  const [position, setPosition] = useState({ top: 100, left: 100 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const landingSectionHeight = window.innerHeight;
      setIsVisible(window.scrollY < landingSectionHeight - 100); // show only in first screen
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const safePadding = 100; // avoids edges
      const maxWidth = window.innerWidth - safePadding - 100;
      const maxHeight = window.innerHeight - safePadding - 100;

      const newTop = Math.random() * maxHeight + safePadding / 2;
      const newLeft = Math.random() * maxWidth + safePadding / 2;

      setPosition({ top: newTop, left: newLeft });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <Image
      src="/Images/magnifyingGlass.png"
      alt="Magnifying Glass"
      width={80}
      height={80}
      className="fixed z-10 transition-all duration-[3000ms] ease-in-out pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
      }}
    />
  );
};

export default ImageGlider;
