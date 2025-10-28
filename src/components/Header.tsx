'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sun, Moon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/ui/SearchBar';
import useIsMobile from '@/hooks/useIsMobile';

const Header = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window !== 'undefined') { // Asegurar que el código solo se ejecute en el cliente
      const savedTheme = localStorage.getItem('theme');
      const initialTheme = savedTheme ? JSON.parse(savedTheme) : true;
      setIsDarkTheme(initialTheme);
      if (initialTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newThemeState = !isDarkTheme;
    setIsDarkTheme(newThemeState);
    if (newThemeState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', JSON.stringify(newThemeState));
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') { // Asegurar que el código solo se ejecute en el cliente
      const whatsappUrl = 'https://wa.me/?text=Descubr%C3%AD%20Saladillo%20Vivo.com,%20mucho%20m%C3%A1s%20que%20noticias';
      window.open(whatsappUrl, '_blank');
    }
  };

  const banerClaroOriginal = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/e9eb6580b7ad5742826daaa5df2b592d.png";
  const banerOscuroOriginal = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/47acc550fd7b520146be23b59835d549.png";

  const banerParaModoClaro = banerClaroOriginal;
  const banerParaModoOscuro = banerOscuroOriginal;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={`bg-main-gradient shadow-header sticky top-0 left-0 right-0 z-50 border-b h-[3.6rem]`}
    >
      <div className="container mx-auto px-4 h-full flex justify-between items-center relative">
        <div className="flex items-center h-full">
          <Link href="/" className="flex items-center h-full">
            <Image
              priority
              src={isDarkTheme ? banerClaroOriginal : banerOscuroOriginal}
              alt="Saladillo Vivo"
              width={216}
              height={58}
              className='object-contain'
            />
          </Link>
        </div>

        <nav className="flex-grow flex justify-end items-center space-x-2">
          <SearchBar />
          <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Compartir en WhatsApp">
            <Share2 size={isMobile ? 18 : 20} className="text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkTheme ? <Sun size={isMobile ? 18 : 20} className="text-foreground" /> : <Moon size={isMobile ? 18 : 20} className="text-foreground" />}
          </Button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
