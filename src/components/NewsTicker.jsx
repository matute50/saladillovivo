import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useNews } from '@/context/NewsContext';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const NewsTicker = ({ isMobile = false }) => {
  const { allTickerTexts, isLoading: newsLoading } = useNews();
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [themeButtonLeft, setThemeButtonLeft] = useState(0);
  const [pauseButtonWidth, setPauseButtonWidth] = useState(0);
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const pauseButtonRef = useRef(null);
  const controls = useAnimationControls();
  const [isDarkTheme, setIsDarkTheme] = useState(document.documentElement.classList.contains('dark'));
  const [animationKey, setAnimationKey] = useState(0); 
  const [tickerTextColor, setTickerTextColor] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchTickerColor = async () => {
      const { data, error } = await supabase
        .from('textos_ticker')
        .select('color')
        .eq('isActive', true)
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching ticker color:", error);
        setTickerTextColor(isDarkTheme ? '#6699ff' : 'rgb(90,90,90)');
      } else {
        setTickerTextColor(data?.color || (isDarkTheme ? '#6699ff' : 'rgb(90,90,90)'));
      }
    };
    fetchTickerColor();
  }, [isDarkTheme]);


  const calculateWidthsAndPosition = () => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    if (textRef.current) {
      setTextWidth(textRef.current.scrollWidth); 
    }
    
    if (!isMobile) {
        const themeButton = document.getElementById('theme-toggle-button-header'); 
        if (themeButton) {
          const rect = themeButton.getBoundingClientRect();
          if (containerRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              setThemeButtonLeft(rect.left - containerRect.left + (rect.width / 2));
          } else {
              setThemeButtonLeft(rect.left + (rect.width / 2));
          }
        }
        if (pauseButtonRef.current) {
          setPauseButtonWidth(pauseButtonRef.current.offsetWidth);
        }
    } else {
        setThemeButtonLeft(0);
        setPauseButtonWidth(0);
    }
  };

  useEffect(() => {
    calculateWidthsAndPosition();
    const themeButton = !isMobile ? document.getElementById('theme-toggle-button-header') : null;
    
    window.addEventListener('resize', calculateWidthsAndPosition);
    const resizeObserver = new ResizeObserver(calculateWidthsAndPosition);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (textRef.current) resizeObserver.observe(textRef.current);
    if (pauseButtonRef.current && !isMobile) resizeObserver.observe(pauseButtonRef.current);
    if (themeButton && !isMobile) resizeObserver.observe(themeButton);
    
    return () => {
      window.removeEventListener('resize', calculateWidthsAndPosition);
      resizeObserver.disconnect();
    };
  }, [allTickerTexts, newsLoading, animationKey, isMobile]);

  useEffect(() => {
    if (textWidth > 0 && containerWidth > 0) {
      const duration = Math.max(40, (textWidth / containerWidth) * 15); 
      
      if (isPaused && !isMobile) {
        controls.stop();
      } else {
        controls.start({
          x: [containerWidth, -textWidth],
          transition: {
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: duration,
              ease: 'linear',
            },
          },
        });
      }
    } else if (textWidth === 0 && containerWidth > 0 && (!isPaused || isMobile) ) {
        controls.start({
             x: [containerWidth, 0], 
             transition: { duration: 0.01 } 
        });
    }
  }, [isPaused, textWidth, containerWidth, controls, animationKey, isMobile]);

  useEffect(() => {
    setAnimationKey(prevKey => prevKey + 1);
    requestAnimationFrame(() => {
        calculateWidthsAndPosition();
    });
  }, [allTickerTexts]);
  
  const concatenatedTickerText = allTickerTexts && allTickerTexts.length > 0 
    ? allTickerTexts.join(" --- ") 
    : "Bienvenido a Saladillo Vivo - Manténgase informado.";

  const displayedText = concatenatedTickerText;

  const maskEndPosition = (themeButtonLeft > 0 && !isMobile) ? themeButtonLeft : containerWidth;
  const maskStartPosition = 0; 
  const tickerBackgroundColor = isDarkTheme ? 'hsl(var(--background))' : 'hsl(var(--background))';

  if ((newsLoading && allTickerTexts.length === 0) || !tickerTextColor) {
    return (
      <div ref={containerRef} className="bg-background dark:bg-background overflow-hidden relative h-8 flex items-center container mx-auto px-4 -mb-px">
        <div className="whitespace-nowrap h-full flex items-center">
          <p className="font-arial italic text-xs animate-pulse text-muted-foreground">
            Cargando últimas noticias...
          </p>
        </div>
      </div>
    );
  }
  
  const desktopMaskStyle = {
    maskImage: `linear-gradient(to right, black ${maskStartPosition}px, black calc(${maskEndPosition}px - ${pauseButtonWidth / 2}px - 5px), transparent calc(${maskEndPosition}px - ${pauseButtonWidth / 2}px))`,
    WebkitMaskImage: `linear-gradient(to right, black ${maskStartPosition}px, black calc(${maskEndPosition}px - ${pauseButtonWidth / 2}px - 5px), transparent calc(${maskEndPosition}px - ${pauseButtonWidth / 2}px))`
  };
  const mobileMaskStyle = {
    maskImage: `linear-gradient(to right, black 0%, black 100%)`,
    WebkitMaskImage: `linear-gradient(to right, black 0%, black 100%)`
  };


  return (
    <div 
      ref={containerRef} 
      className="bg-background dark:bg-background overflow-hidden relative h-8 flex items-center container mx-auto px-0 ticker-container z-30 -mb-px"
    >
      <motion.div
        key={animationKey}
        ref={textRef}
        className="absolute whitespace-nowrap h-full flex items-center"
        animate={controls}
        initial={{ x: containerWidth }}
      >
        <p className="font-arial italic text-xs px-4" style={{ color: tickerTextColor }}>
          {displayedText}
        </p>
      </motion.div>
      {!isMobile && themeButtonLeft > 0 && (
        <>
          <div 
            className="absolute top-0 h-full z-35"
            style={{ 
              left: `calc(${themeButtonLeft}px + ${pauseButtonWidth / 2}px)`, 
              width: `calc(100% - (${themeButtonLeft}px + ${pauseButtonWidth / 2}px))`, 
              backgroundColor: tickerBackgroundColor
            }}
          />
          <Button
            ref={pauseButtonRef}
            variant="ghost"
            size="icon"
            className="control-button absolute top-1/2 transform -translate-y-1/2 z-40 p-1 h-8 w-8 rounded-md"
            style={{ left: `calc(${themeButtonLeft}px - ${pauseButtonWidth / 2}px)` }}
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Reanudar scroll" : "Pausar scroll"}
          >
            {isPaused ? <Play size={18} className="text-foreground" /> : <Pause size={18} className="text-foreground" />}
          </Button>
        </>
      )}
    </div>
  );
};

export default NewsTicker;