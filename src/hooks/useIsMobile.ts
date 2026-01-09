'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to determine if the screen width is mobile.
 * @returns {boolean} True if the screen width is less than 1024px.
 */
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') { // Asegurar que el código solo se ejecute en el cliente
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 1024); // Accesses window
      };

      checkScreenSize(); // Initial call
      window.addEventListener('resize', checkScreenSize); // Event listener

      return () => {
        window.removeEventListener('resize', checkScreenSize);
      };
    }
  }, []);

  return isMobile;
};

export default useIsMobile;