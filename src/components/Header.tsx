'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sun, Moon, Share2, Tv, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/ui/SearchBar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

// Definimos los props para que TypeScript no de error en el Layout
interface HeaderProps {
  ticker?: string[];
}

const Header = ({ ticker = [] }: HeaderProps) => {
  const { viewMode, setViewMode } = useMediaPlayer();
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const initialTheme = savedTheme === 'dark';
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
    localStorage.setItem('theme', newThemeState ? 'dark' : 'light');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const whatsappUrl = 'https://wa.me/?text=Descubr%C3%AD%20Saladillo%20Vivo.com,%20mucho%20m%C3%A1s%20que%20noticias';
      window.open(whatsappUrl, '_blank');
    }
  };

  const banerClaroOriginal = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/e9eb6580b7ad5742826daaa5df2b592d.png";
  const banerOscuroOriginal = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/47acc550fd7b520146be23b59835d549.png";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="bg-main-gradient sticky top-0 left-0 right-0 z-[100] h-[3.3174rem] border-b border-white/5"
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
              style={{ width: 'auto', height: 'auto' }}
              className='object-contain'
            />
          </Link>
        </div>

        <nav className="flex-grow flex justify-end items-center space-x-2">
          <SearchBar />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMode(viewMode === 'diario' ? 'tv' : 'diario')}  
            aria-label="Cambiar modo"
            className="text-white"
          >
            {viewMode === 'diario' ? <Tv size={20} /> : <Newspaper size={20} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} className="text-white">
            <Share2 size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-white">
            {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;