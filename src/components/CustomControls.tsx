'use client';

import React, { useState, useEffect } from 'react';
import { useVolume } from '@/context/VolumeContext';
import { useMediaPlayer } from '@/context/MediaPlayerContext';

// --- (Iconos estándar - sin cambios) ---
const PlayIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M8 5V19L19 12L8 5Z" /> </svg> );
const PauseIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" /> </svg> );
const FullScreenIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /> </svg> );
const ExitFullScreenIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /> </svg> );

// --- ARREGLO 1: Añadir los nuevos iconos de volumen ---
// Icono para Sonido Activo (Unmute)
const VolumeOnIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
);

// Icono para Mute (Silencio)
const VolumeMuteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <line x1="23" y1="9" x2="17" y2="15"></line>
    <line x1="17" y1="9" x2="23" y2="15"></line>
  </svg>
);
// --- FIN ARREGLO 1 ---

// --- (Interfaces, formatTime, defaultProgress - sin cambios) ---
const formatTime = (seconds: number) => { if (isNaN(seconds) || seconds === Infinity) { return '0:00'; } const date = new Date(seconds * 1000); const hh = date.getUTCHours(); const mm = date.getUTCMinutes(); const ss = date.getUTCSeconds().toString().padStart(2, '0'); if (hh) { return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`; } return `${mm}:${ss}`; };
interface ProgressState { played: number; playedSeconds: number; loaded: number; loadedSeconds: number; }
interface CustomControlsProps { onToggleFullScreen: () => void; isFullScreen: boolean; progress: ProgressState; duration: number; setSeekToFraction: (fraction: number | null) => void; }
const defaultProgress: ProgressState = { played: 0, playedSeconds: 0, loaded: 0, loadedSeconds: 0, };
// --- (Fin de la sección sin cambios) ---


const CustomControls: React.FC<CustomControlsProps> = ({ 
  onToggleFullScreen, 
  isFullScreen,
  progress = defaultProgress,
  duration,
  setSeekToFraction
}) => {
  
  // Obtenemos todo del contexto. Las funciones están limpias.
  const { isPlaying, togglePlayPause } = useMediaPlayer();
  const { isMuted, volume, setVolume, toggleMute } = useVolume();

  // (Lógica de Scrubbing de Progreso - sin cambios)
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  useEffect(() => { if (!isScrubbing) { setSliderValue(progress?.played || 0); } }, [progress?.played, isScrubbing]); 

  // Funciones simplificadas. Solo llaman al contexto.
  const handleToggleMute = () => { if (toggleMute) toggleMute(); };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (setVolume) {
      setVolume(newVolume);
    }
  };

  // (Lógica de Seek/Scrubbing de Progreso - sin cambios)
  const handleSeekMouseDown = () => { setIsScrubbing(true); };
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => { setIsScrubbing(false); if (setSeekToFraction) { const newFraction = parseFloat((e.target as HTMLInputElement).value); setSeekToFraction(newFraction); } };
  const handleSeekOnChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSliderValue(parseFloat(e.target.value)); };

  const currentTime = formatTime(progress?.playedSeconds || 0);
  const totalTime = formatTime(duration);

  return (
    <div className="flex w-full flex-col bg-black bg-opacity-60 px-4 pt-1 text-white">
      
      {/* (Barra de Progreso - sin cambios) */}
      <div className="relative w-full h-2 group mb-1">
        <input
          type="range" min="0" max="0.999999" step="0.001"
          value={sliderValue}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleSeekMouseUp}  
          onChange={handleSeekOnChange}  
          className="absolute z-10 w-full h-1 bg-transparent appearance-none cursor-pointer top-1/2 -translate-y-1/2 group-hover:h-2 transition-all"
          style={{ background: `linear-gradient(to right, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.8) ${sliderValue * 100}%, rgba(255, 255, 255, 0.3) ${sliderValue * 100}%, rgba(255, 255, 255, 0.3) ${progress?.loaded * 100 || 0}%, rgba(255, 255, 255, 0.1) ${progress?.loaded * 100 || 0}%, rgba(255, 255, 255, 0.1) 100%)` }}
        />
      </div>
      
      <div className="flex w-full items-center justify-between pt-1 pb-2">
        {/* (Controles Izquierdos - sin cambios) */}
        <div className="flex items-center gap-4">
          <button onClick={togglePlayPause} className="text-white focus:outline-none" aria-label={isPlaying ? "Pausar" : "Reproducir"} >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className="text-xs font-medium tracking-wide" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {currentTime} / {totalTime}
          </span>
        </div>

        {/* --- Controles Derechos --- */}
        <div className="flex items-center gap-3">
          
          {/* --- ARREGLO 2: Reemplazar emoji por iconos --- */}
          <button
            onClick={handleToggleMute}
            className="text-white focus:outline-none" // <-- Se quitó 'text-2xl'
            aria-label={isMuted ? "Activar sonido" : "Desactivar sonido"}
          >
            {isMuted ? <VolumeMuteIcon /> : <VolumeOnIcon />}
          </button>
          {/* --- FIN ARREGLO 2 --- */}
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume || 0} 
            onChange={handleVolumeChange} 
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: 'white' }} 
          />
          
          <button
            onClick={onToggleFullScreen}
            className="text-white focus:outline-none"
            aria-label={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullScreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomControls;