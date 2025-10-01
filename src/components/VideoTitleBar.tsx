'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoTitleBar = ({ playingMedia, isMobile }) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  let titleText = null;
  if (playingMedia) {
    if (playingMedia.type === 'stream') {
      titleText = `ESTÁS VIENDO EN VIVO ${playingMedia.title.toUpperCase()}`;
    } else if (playingMedia.category !== 'SV') {
      titleText = `ESTÁS VIENDO ${playingMedia.category.toUpperCase()}, ${playingMedia.title.toUpperCase()}`;
    } else {
      titleText = ' '; // Empty space for SV category
    }
  }

  useEffect(() => {
    const checkOverflow = () => {
      if (isMobile && textRef.current && containerRef.current) {
        const isCurrentlyOverflowing = textRef.current.scrollWidth > containerRef.current.clientWidth;
        if (isCurrentlyOverflowing !== isOverflowing) {
          setIsOverflowing(isCurrentlyOverflowing);
        }
      } else if (!isMobile) {
        setIsOverflowing(false);
      }
    };
    
    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 2100); // Re-check after fade-in
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [titleText, isMobile, isOverflowing]);

  useEffect(() => {
    if (!titleText || titleText.trim() === '') {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    let visibilityTimeout;
    let animationInterval;

    if (isMobile) {
        const sequence = () => {
            setIsVisible(true);
            setAnimationKey(prev => prev + 1); // Trigger animation/scroll

            visibilityTimeout = setTimeout(() => {
                setIsVisible(false);
            }, 8000); // 8s visible
        };

        sequence();
        animationInterval = setInterval(sequence, 23000); // 8s visible + 15s delay
    } else {
        // Desktop logic, simple fade in/out
        setIsVisible(true);
    }
    
    return () => {
      clearTimeout(visibilityTimeout);
      clearInterval(animationInterval);
    };

  }, [isMobile, isOverflowing, titleText]);

  const mobileScrollVariants = {
    animate: {
      x: [0, -(textRef.current?.scrollWidth || 0) + (containerRef.current?.clientWidth || 0) - 5],
      transition: {
        x: {
          duration: 7,
          ease: 'linear',
          delay: 1, // Start scroll after 1 sec
        },
      }
    }
  };
  
  return (
    <div ref={containerRef} className="w-full pl-1 pt-1 overflow-hidden h-[20px]">
      <AnimatePresence>
        {titleText && titleText.trim() !== '' && isVisible && (
          <motion.div
            key={animationKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-full"
          >
            <motion.p
              ref={textRef}
              className="font-century-gothic text-xs uppercase text-foreground whitespace-nowrap"
              variants={isOverflowing ? mobileScrollVariants : {}}
              animate="animate"
            >
              {titleText}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoTitleBar;
