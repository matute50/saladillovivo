"use client";

import React, { useRef, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

// --- Constantes ---
const INTRO_MUSIC_SRC = '/audio/news-intro.mp3';
const INTRO_DURATION = 2;
const OUTRO_DURATION = 3;
const FINAL_FADE_DURATION = 1.5;

// --- Interfaces ---
interface Article {
  id: string;
  title: string;
  imageUrl?: string | null;
  audio_url?: string | null;
  miniatura_url?: string | null;
}

interface NewsSlideProps {
  article: Article | null;
  onClose?: () => void;
  isPublicView?: boolean;
  isForCapture?: boolean;
}

// --- Componente: Fondo Geométrico Animado ---
const GeometricBackground = () => {
  const shapes = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    width: Math.random() * 300 + 50,
    height: Math.random() * 50 + 10,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 5 + 3,
    delay: Math.random() * 2,
    color: i % 2 === 0 ? 'bg-blue-900' : 'bg-red-600',
    opacity: Math.random() * 0.5 + 0.3,
  }));

  return (
    <div className="absolute bottom-0 right-0 w-2/3 h-2/3 overflow-hidden z-10 opacity-80 pointer-events-none mix-blend-overlay">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.color} rounded-sm`}
          style={{
            width: shape.width,
            height: shape.height,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            opacity: shape.opacity,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 50 - 25],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};

// --- Componente: Líneas Punteadas SVG ---
const DottedLines = () => {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="fadeHorizontal" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fadeVertical" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.line
          x1="98%" y1="95%" x2="10%" y2="95%"
          stroke="url(#fadeHorizontal)"
          strokeWidth="4"
          strokeDasharray="10 20"
          animate={{ strokeDashoffset: [0, -60] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <motion.line
          x1="95%" y1="98%" x2="95%" y2="10%"
          stroke="url(#fadeVertical)"
          strokeWidth="4"
          strokeDasharray="10 20"
          animate={{ strokeDashoffset: [0, -60] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

// --- Componente: Ticker Tape (Zócalo) ---
const TickerTape = ({ text }: { text: string }) => {
  const textVariants = {
    animate: {
      x: ['100%', '-100%'],
      transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 25, ease: 'linear' } },
    },
  };
  return (
    <div className="absolute bottom-0 left-0 w-full h-12 bg-red-700/90 backdrop-blur-md overflow-hidden z-40 border-t-4 border-red-500">
      <motion.div className="absolute whitespace-nowrap flex items-center h-full" variants={textVariants} animate="animate">
        <span className="text-2xl font-bold uppercase text-white px-8 tracking-widest">{text}  +++  {text}  +++  {text}</span>
      </motion.div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function NewsSlide({ article, onClose, isPublicView = false, isForCapture = false }: NewsSlideProps) {
  const voiceAudioRef = useRef<HTMLAudioElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const [isReady, setIsReady] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPlaybackBlocked, setIsPlaybackBlocked] = useState(false);

  // Fallback seguro de duración
  const safeAudioDuration = audioDuration > 0 ? audioDuration : 10;
  const totalDuration = INTRO_DURATION + safeAudioDuration + OUTRO_DURATION;

  // Lógica de Audio (Robusta)
  const startAudioSequence = () => {
    if (isForCapture || !isReady || !article) return;
    const voiceAudio = voiceAudioRef.current;
    const musicAudio = musicAudioRef.current;
    if (!musicAudio) return;

    setIsPlaybackBlocked(false);

    musicAudio.play().then(() => {
      musicAudio.currentTime = 0;
      musicAudio.volume = 1;
      const duckingTimer = setTimeout(() => {
        animateVolume(musicAudio, 0.2, 500);
        if (voiceAudio && article.audio_url) {
            voiceAudio.currentTime = 0;
            voiceAudio.play().catch(e => console.error("Error voz:", e));
        }
      }, INTRO_DURATION * 1000);
      timersRef.current.push(duckingTimer);
    }).catch(() => setIsPlaybackBlocked(true));

    const onVoiceEnd = () => {
      animateVolume(musicAudio, 1, 750);
      if (isPublicView) {
        const restartTimer = setTimeout(startAudioSequence, OUTRO_DURATION * 1000);
        timersRef.current.push(restartTimer);
      } else {
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
          animateVolume(musicAudio, 0, FINAL_FADE_DURATION * 1000);
          if (onClose) {
             const unmountTimer = setTimeout(onClose, FINAL_FADE_DURATION * 1000);
             timersRef.current.push(unmountTimer);
          }
        }, (OUTRO_DURATION - FINAL_FADE_DURATION) * 1000);
        timersRef.current.push(fadeTimer);
      }
    };

    if (voiceAudio && article.audio_url) {
        voiceAudio.addEventListener('ended', onVoiceEnd, { once: true });
    } else {
        timersRef.current.push(setTimeout(onVoiceEnd, (INTRO_DURATION + safeAudioDuration) * 1000));
    }
  };

  useEffect(() => {
    if (isForCapture) { setIsReady(true); return; }
    const voiceAudio = voiceAudioRef.current;
    
    if (article && !article.audio_url) {
        setAudioDuration(10); setIsReady(true); return;
    }
    if (article && voiceAudio && article.audio_url) {
      const onMetadata = () => { setAudioDuration(voiceAudio.duration); setIsReady(true); };
      const onError = () => { setAudioDuration(10); setIsReady(true); };
      voiceAudio.addEventListener('loadedmetadata', onMetadata);
      voiceAudio.addEventListener('error', onError);
      voiceAudio.load();
      musicAudioRef.current?.load();
      return () => {
        voiceAudio.removeEventListener('loadedmetadata', onMetadata);
        voiceAudio.removeEventListener('error', onError);
        setIsReady(false); setAudioDuration(0); setIsFadingOut(false);
      };
    }
  }, [article, isForCapture]);

  useEffect(() => {
    if (!isReady) return;
    startAudioSequence();
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (musicAudioRef.current) setTimeout(() => musicAudioRef.current?.pause(), 300);
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const titleLines = useMemo(() => article ? splitTitleIntoLines(article.title, 3) : [], [article]);
  if (!article) return null;

  const scale = 0.75;
  const containerStyle = { transform: isForCapture ? 'none' : `scale(${scale})`, transformOrigin: 'center' };

  return (
    <motion.div
      key={article.id}
      initial={{ opacity: 0 }}
      animate={isFadingOut ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: isFadingOut ? FINAL_FADE_DURATION : 0.5 }}
      className={isForCapture ? "relative w-full h-full bg-black" : "fixed inset-0 z-50 flex items-center justify-center bg-black"}
    >
      <motion.div className="relative w-[1280px] h-[720px] bg-black shadow-2xl overflow-hidden" style={containerStyle}>
        
        {/* 1. Fondo Imagen con Ken Burns */}
        {isReady && (
          <motion.div className="absolute inset-0 z-0" animate={{ scale: [1.0, 1.25, 1.0] }} transition={{ duration: totalDuration, ease: 'linear', repeat: Infinity }}>
            <Image src={article.miniatura_url || article.imageUrl || ''} alt={article.title} fill className="object-cover" priority />
          </motion.div>
        )}

        {/* 2. Overlays y Gradientes */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 z-10" style={{ boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)' }}></div>

        {/* 3. FONDO GEOMÉTRICO */}
        <GeometricBackground />
        
        {/* 4. LÍNEAS SVG */}
        <DottedLines />

        {/* 5. Logo */}
        <div className="absolute top-8 left-8 z-30 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
             <Image src="/logos/noticias.png" alt="Noticias" width={220} height={100} className="object-contain" />
        </div>

        {/* 6. TÍTULO (Estilo Broadcast Recuperado) */}
        {isReady && (
          <div className="absolute bottom-24 right-12 z-30 flex flex-col items-end gap-2 text-right">
              {titleLines.map((line, index) => (
                <motion.div 
                  key={index} 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 + (index * 0.2), ease: "easeOut" }}
                  className="bg-blue-900/80 backdrop-blur-sm px-6 py-2 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] transform -skew-x-6 border-r-4 border-red-500"
                >
                  <h1 className="text-white text-5xl font-black uppercase tracking-tighter transform skew-x-6" 
                      style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.8)' }}>
                    {line}
                  </h1>
                </motion.div>
              ))}
          </div>
        )}

        {/* 7. Barra de Progreso y Ticker */}
        <TickerTape text={article.title} />
        {isReady && !isForCapture && (
          <motion.div className="absolute top-0 left-0 h-1.5 bg-red-600 z-50" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: totalDuration, ease: "linear" }} />
        )}

        {/* 8. Botón Playback */}
        {isPlaybackBlocked && (
            <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
                <button onClick={startAudioSequence} className="flex items-center gap-4 text-white text-2xl font-bold bg-red-600 px-10 py-6 rounded-xl animate-pulse">
                <Volume2 size={40} /> INICIAR NOTICIA
                </button>
            </div>
        )}
      </motion.div>

      {!isForCapture && (
        <>
          <audio ref={voiceAudioRef} src={article.audio_url || undefined} preload="auto" />
          <audio ref={musicAudioRef} src={INTRO_MUSIC_SRC} preload="auto" loop />
        </>
      )}
    </motion.div>
  );
}

// Funciones Auxiliares
const splitTitleIntoLines = (text: string, maxLines: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const idealLineLength = Math.max(20, text.length / maxLines); 
  words.forEach((word) => {
    if (lines.length >= maxLines - 1) { currentLine = [currentLine, word].filter(Boolean).join(' '); }
    else if (currentLine.length > 0 && (currentLine + ' ' + word).length > idealLineLength) { lines.push(currentLine); currentLine = word; }
    else { currentLine = [currentLine, word].filter(Boolean).join(' '); }
  });
  lines.push(currentLine);
  return lines.slice(0, maxLines);
};

function animateVolume(audio: HTMLAudioElement, targetVolume: number, duration: number = 500) {
  if (!audio) return;
  const start = audio.volume;
  let startTime = 0;
  const frame = (t: number) => {
    if (!startTime) startTime = t;
    const progress = Math.min((t - startTime) / duration, 1);
    audio.volume = start + (targetVolume - start) * progress;
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}