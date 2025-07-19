import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

const Header = ({ isMobile }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(document.documentElement.classList.contains('dark'));
  const headerRef = useRef(null);

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
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentThemeIsDark = document.documentElement.classList.contains('dark');
      if (currentThemeIsDark !== isDarkTheme) {
        setIsDarkTheme(currentThemeIsDark);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      observer.disconnect();
    };
  }, [isDarkTheme]);

  const handleShare = () => {
    const whatsappUrl = 'https://wa.me/?text=Descubr%C3%AD%20Saladillo%20Vivo.com,%20mucho%20m%C3%A1s%20que%20noticias';
    window.open(whatsappUrl, '_blank');
  };

  const banerClaroOriginal = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/e9eb6580b7ad5742826daaa5df2b592d.png";
  const banerOscuroOriginal = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/47acc550fd7b520146be23b59835d549.png";
  
  const banerParaModoClaro = banerOscuroOriginal;
  const banerParaModoOscuro = banerClaroOriginal;

  const headerDynamicHeightClass = isMobile ? 'h-[var(--header-height)]' : 'h-[var(--desktop-header-height)]';
  const headerPositionClass = isMobile ? 'fixed' : 'sticky';
  
  const headerBgClass = isDarkTheme 
    ? "bg-gradient-to-b from-[hsl(var(--background-start))] to-[hsl(var(--background-end))]"
    : "bg-gradient-to-b from-[hsl(var(--background-start))] to-[hsl(var(--background-end))]";

  return (
    <motion.header 
      ref={headerRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={`${headerBgClass} shadow-header ${headerPositionClass} top-0 left-0 right-0 z-50 border-b ${headerDynamicHeightClass}`}
    >
      <div className="container mx-auto px-4 h-full flex justify-between items-center relative">
        <div className="flex items-center h-full">
          <Link to="/" className="flex items-center h-full">
            <img 
              loading="eager"
              src={isDarkTheme ? banerParaModoOscuro : banerParaModoClaro}
              alt="Saladillo Vivo"
              className={`${isMobile ? 'h-10' : 'h-12'} object-contain`}
            />
          </Link>
        </div>

        <nav className="flex items-center space-x-2">
           <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Compartir en WhatsApp" className="control-button">
            <Share2 size={isMobile ? 18 : 20} className="text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" id="theme-toggle-button-header" className="control-button">
            {isDarkTheme ? <Sun size={isMobile ? 18 : 20} className="text-foreground" /> : <Moon size={isMobile ? 18 : 20} className="text-foreground" />}
          </Button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;