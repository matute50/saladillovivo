'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CreatorModal from './modals/CreatorModal';
import ImageModal from './ImageModal';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isCreatorModalOpen, setCreatorModalOpen] = useState(false);
  const [isDecretoModalOpen, setDecretoModalOpen] = useState(false);

  const decretoImageUrl = "https://otwvfihzaznyjvjtkvvd.supabase.co/storage/v1/object/public/imagenvideos//decreto.png";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkTheme = () => setIsDarkTheme(document.documentElement.classList.contains('dark'));
      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  const banerClaro = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/e9eb6580b7ad5742826daaa5df2b592d.png";
  const banerOscuro = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/47acc550fd7b520146be23b59835d549.png";

  return (
    <footer className={`bg-gradient-to-b from-[hsl(var(--footer-bg-start))] to-[hsl(var(--footer-bg-end))] dark:bg-[hsl(var(--footer-bg-color))] text-foreground py-2 shadow-footer`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center text-center gap-2 md:gap-4 w-full">
          
          {/* 1. LOGO REDUCIDO AL 50% */}
          <div className="flex-shrink-0">
            <Image
              src={isDarkTheme ? banerClaro : banerOscuro}
              alt="Logo Saladillo Vivo"
              // Reducimos width de 140 a 70
              width={70} 
              // Reducimos height de 40 a 20
              height={20}
              // Ajustamos la altura máxima visual
              className="object-contain h-auto w-auto max-h-[20px]"
              priority 
            />
          </div>

          {/* Separador visual (solo desktop) */}
          <span className="hidden md:block text-gray-400 dark:text-gray-600 text-[10px]">|</span>

          {/* 2. TEXTO DECRETO */}
          <p className="text-[9px] m-0 leading-none text-gray-600 dark:text-gray-300">
            Declarado de interés cultural{' '}
            <span
              onClick={() => setDecretoModalOpen(true)}
              className="font-bold underline cursor-pointer text-[#003399] dark:text-[#6699ff] hover:text-blue-400 transition-colors"
            >
              DECRETO H.C.D. Nro. 37/2022
            </span>
          </p>

          {/* Separador visual (solo desktop) */}
          <span className="hidden md:block text-gray-400 dark:text-gray-600 text-[10px]">|</span>

          {/* 3. COPYRIGHT Y CRÉDITOS */}
          <p className="text-[9px] m-0 leading-none text-gray-600 dark:text-gray-300">
            © {currentYear} Saladillo Vivo. Desarrollado por:{' '}
            <span
              onClick={() => setCreatorModalOpen(true)}
              className="font-bold underline cursor-pointer text-[#003399] dark:text-[#6699ff] hover:text-blue-400 transition-colors"
            >
              Matías Vidal
            </span>
          </p>

        </div>
      </div>

      <CreatorModal isOpen={isCreatorModalOpen} onClose={() => setCreatorModalOpen(false)} />
      <ImageModal isOpen={isDecretoModalOpen} onClose={() => setDecretoModalOpen(false)} imageUrl={decretoImageUrl} imageAlt="Decreto H.C.D. Nro. 37/2022" />
    </footer>
  );
};

export default Footer;