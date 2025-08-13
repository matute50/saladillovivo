import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useNews } from '@/context/NewsContext';
import { Pause, Play } from 'lucide-react';

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
    setTickerTextColor(isDarkTheme ? '#6699ff' : 'rgb(90,90,90)');
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
              setThemeButtonTop(rect.top);
              setThemeButtonHeight(rect.height);
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

  const tickerVisibleWidth = (themeButtonLeft > 0 && !isMobile) ? (themeButtonLeft - (pauseButtonWidth / 2)) : containerWidth;

  useEffect(() => {
    if (textWidth > 0 && containerWidth > 0) {
      const duration = Math.max(40, (textWidth / tickerVisibleWidth) * 15); 
      
      if (isPaused && !isMobile) {
        controls.stop();
      } else {
        controls.start({
          x: [tickerVisibleWidth, -textWidth],
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
  }, [isPaused, textWidth, containerWidth, controls, animationKey, isMobile, tickerVisibleWidth]);

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
  
  return (
    <div 
      ref={containerRef} 
      className="bg-background dark:bg-background overflow-hidden relative h-8 flex items-center container mx-auto px-0 ticker-container z-30 -mb-px"
    >
      <motion.div
        key={animationKey}
        ref={textRef}
        className="whitespace-nowrap h-full flex items-center z-30 flex-grow"
        animate={controls}
        initial={{ x: containerWidth }}
        style={{ width: tickerVisibleWidth }}
      >
        <p className="font-arial italic text-xs px-4" style={{ color: tickerTextColor }}>
          {displayedText}
        </p>
      </motion.div>
      {!isMobile && themeButtonLeft > 0 && (
        <>
          
        </>
      )}
    </div>
  );
};

export default NewsTicker;