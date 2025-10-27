'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to determine if the screen width is mobile.
 * @returns {boolean} True if the screen width is less than 1024px.
 */
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // Breakpoint for desktop layout
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
};

export default useIsMobile;
