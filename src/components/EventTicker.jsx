import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EventTicker = ({ events, isDarkTheme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 8000); 

    return () => clearInterval(interval);
  }, [events]);

  if (!events || events.length === 0) {
    return (
      <span className={`font-arial font-bold text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
        No hay eventos programados.
      </span>
    );
  }

  const currentEvent = events[currentIndex];
  const date = new Date(currentEvent.eventDateTime);
  
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayAbbreviated = days[date.getUTCDay()];
  const dayOfMonth = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  
  const eventNameUpper = currentEvent.name.toUpperCase();
  const formattedDate = `${dayAbbreviated} ${dayOfMonth}/${month} ${hours}.${minutes} hs`;
  const eventText = `${eventNameUpper} - ${formattedDate}`;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className={`font-arial font-bold text-xs ${isDarkTheme ? 'text-white' : 'text-foreground'}`}
      >
        {eventText}
      </motion.span>
    </AnimatePresence>
  );
};

export default EventTicker;