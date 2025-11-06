'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CreatorModal from './CreatorModal';
import ImageModal from './ImageModal';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isCreatorModalOpen, setCreatorModalOpen] = useState(false);
  const [isDecretoModalOpen, setDecretoModalOpen] = useState(false);

  const decretoImageUrl = "https://otwvfihzaznyjvjtkvvd.supabase.co/storage/v1/object/public/imagenvideos//decreto.png";

  useEffect(() => {
    if (typeof window !== 'undefined') { // Asegurar que el código solo se ejecute en el cliente
      const observer = new MutationObserver(() => {
        setIsDarkTheme(document.documentElement.classList.contains('dark'));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  const banerClaro = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/e9eb6580b7ad5742826daaa5df2b592d.png";
  const banerOscuro = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/47acc550fd7b520146be23b59835d549.png";

  return (
    <footer className={`bg-gradient-to-b from-[hsl(var(--footer-bg-start))] to-[hsl(var(--footer-bg-end))] dark:bg-[hsl(var(--footer-bg-color))] text-foreground py-3 shadow-footer`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0 flex flex-col items-center w-full">
            <Image
              loading="lazy"
              src={isDarkTheme ? banerOscuro : banerClaro}
              alt="Logo de Saladillo Vivo en el pie de página"
              width={100}
              height={24}
              className="object-contain mb-2"
            />
            <p className="text-[9px] mb-1">
              Saladillo Vivo declarado de interés cultural y municipal {' '}
              <span
                onClick={() => setDecretoModalOpen(true)}
                className="font-bold underline cursor-pointer text-[#003399] dark:text-[#6699ff]"
              >
                DECRETO H.C.D. Nro. 37/2022
              </span>
            </p>
            <p className={`text-[9px]`}>
              © {currentYear} Saladillo Vivo. Desarrollo de software y contenidos por{' '}
              <span
                onClick={() => setCreatorModalOpen(true)}
                className="font-bold underline cursor-pointer text-[#003399] dark:text-[#6699ff]"
              >
                Matías Vidal
              </span>
              . Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      <CreatorModal isOpen={isCreatorModalOpen} onClose={() => setCreatorModalOpen(false)} />
      <ImageModal isOpen={isDecretoModalOpen} onClose={() => setDecretoModalOpen(false)} imageUrl={decretoImageUrl} imageAlt="Decreto H.C.D. Nro. 37/2022" />
    </footer>
  );
};

export default Footer;