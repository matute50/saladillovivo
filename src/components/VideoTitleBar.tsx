'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoTitleBar = ({ playingMedia, activeCategory, isMobile, isPlaying, progress, duration }) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const visibilityTimer = useRef<NodeJS.Timeout | null>(null);
  const periodicTimer = useRef<NodeJS.Timeout | null>(null);

  let titleText = null;
  if (playingMedia) {
    const categoryToShow = activeCategory || playingMedia.category;
    if (playingMedia.type === 'stream') {
      titleText = `EN VIVO: ${playingMedia.title.toUpperCase()}`;
    } else if (categoryToShow && categoryToShow !== 'SV') {
      titleText = `${categoryToShow.toUpperCase()}, ${playingMedia.title.toUpperCase()}`;
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
    const timeoutId = setTimeout(checkOverflow, 2100);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [titleText, isMobile, isOverflowing]);

  useEffect(() => {
    const cleanup = () => {
      if (visibilityTimer.current) clearTimeout(visibilityTimer.current);
      if (periodicTimer.current) clearInterval(periodicTimer.current);
    };

    if (!isPlaying || duration <= 0 || !titleText || titleText.trim() === '') {
      setIsVisible(false);
      cleanup();
      return;
    }

    const showBar = () => {
      setIsVisible(true);
      visibilityTimer.current = setTimeout(() => {
        setIsVisible(false);
      }, 20000); // 20 seconds
    };

    // Initial show
    showBar();

    // Periodic show every 3 minutes
    periodicTimer.current = setInterval(showBar, 3 * 60 * 1000);

    return cleanup;
  }, [isPlaying, duration, titleText]);

  useEffect(() => {
    if (!isPlaying || duration <= 0) return;

    const currentTime = progress * duration;
    const remainingTime = duration - currentTime;

    if (remainingTime <= 20) {
      if (!isVisible) {
        setIsVisible(true);
        // When it becomes visible due to the last 20 seconds, we don't want it to hide
        if (visibilityTimer.current) clearTimeout(visibilityTimer.current);
      }
    }
  }, [isPlaying, progress, duration, isVisible]);


  const mobileScrollVariants = {
    animate: {
      x: [0, -(textRef.current?.scrollWidth || 0) + (containerRef.current?.clientWidth || 0) - 5],
      transition: {
        x: {
          duration: 7,
          ease: 'linear',
          delay: 1,
        },
      }
    }
  };
  
  return (
    <div ref={containerRef} className="w-full pl-1 pt-1 overflow-hidden h-[20px]">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full"
          >
            <motion.p
              ref={textRef}
              className="font-century-gothic text-xs uppercase text-foreground whitespace-nowrap"
              variants={isOverflowing ? mobileScrollVariants : {}}
              animate={isOverflowing ? "animate" : ""}
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