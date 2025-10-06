'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const NewsTicker = ({ tickerTexts, isMobile = false }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const controls = useAnimationControls();
  const [animationKey, setAnimationKey] = useState(0);
  const [tickerTextColor, setTickerTextColor] = useState('rgb(90,90,90)');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setTickerTextColor(isDark ? '#6699ff' : 'rgb(90,90,90)');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    // Set initial color
    const isDark = document.documentElement.classList.contains('dark');
    setTickerTextColor(isDark ? '#6699ff' : 'rgb(90,90,90)');
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const calculateWidths = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
      if (textRef.current) {
        setTextWidth(textRef.current.scrollWidth);
      }
    };

    calculateWidths();
    window.addEventListener('resize', calculateWidths);
    const resizeObserver = new ResizeObserver(calculateWidths);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (textRef.current) resizeObserver.observe(textRef.current);

    return () => {
      window.removeEventListener('resize', calculateWidths);
      resizeObserver.disconnect();
    };
  }, [tickerTexts, animationKey, isMobile]);

  useEffect(() => {
    if (textWidth > 0 && containerWidth > 0) {
      const duration = Math.max(40, (textWidth / containerWidth) * 15);

      if (isPaused) {
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
    } else if (textWidth === 0 && containerWidth > 0 && !isPaused) {
      controls.start({ x: [containerWidth, 0], transition: { duration: 0.01 } });
    }
  }, [isPaused, textWidth, containerWidth, controls, animationKey]);

  useEffect(() => {
    setAnimationKey(prevKey => prevKey + 1);
  }, [tickerTexts]);

  const concatenatedTickerText = tickerTexts && tickerTexts.length > 0
    ? tickerTexts.join("  ---  ") + "  ---  " + tickerTexts.join("  ---  ") // Duplicar el texto para un desplazamiento continuo
    : "Bienvenido a Saladillo Vivo - Manténgase informado.  ---  Bienvenido a Saladillo Vivo - Manténgase informado.";

  if (!tickerTexts) {
    return (
      <div ref={containerRef} className="bg-background overflow-hidden relative h-8 flex items-center container mx-auto px-4 -mb-px">
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
      className="bg-background overflow-hidden relative h-8 flex items-center container mx-auto px-0 ticker-container z-30 -mb-px"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        key={animationKey}
        ref={textRef}
        className="whitespace-nowrap h-full flex items-center z-30"
        animate={controls}
        initial={{ x: containerWidth }}
      >
        <p className="font-arial italic text-xs px-4" style={{ color: tickerTextColor }}>
          {concatenatedTickerText}
        </p>
      </motion.div>
    </div>
  );
};

export default NewsTicker;
