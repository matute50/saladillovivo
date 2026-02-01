'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Sun,
    Moon,
    Cloud,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Wind,
    CloudFog,
    CloudDrizzle,
    Search,
    MapPin,
    X,
    ChevronDown
} from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { motion, AnimatePresence } from 'framer-motion';

// Mapping WMO codes to Icons
// https://open-meteo.com/en/docs
const getWeatherIcon = (code: number, isDay: boolean = true) => {
    if (code === 0) return isDay ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-200" />;
    if (code >= 1 && code <= 3) return <Cloud size={20} className="text-gray-300" />; // Cloudy
    if (code >= 45 && code <= 48) return <CloudFog size={20} className="text-gray-400" />; // Fog
    if (code >= 51 && code <= 55) return <CloudDrizzle size={20} className="text-blue-300" />; // Drizzle
    if (code >= 61 && code <= 67) return <CloudRain size={20} className="text-blue-400" />; // Rain
    if (code >= 71 && code <= 77) return <CloudSnow size={20} className="text-white" />; // Snow
    if (code >= 80 && code <= 82) return <CloudRain size={20} className="text-blue-500" />; // Showers
    if (code >= 95 && code <= 99) return <CloudLightning size={20} className="text-yellow-500" />; // Storm
    return <Wind size={20} className="text-gray-300" />;
};

const WeatherWidget = () => {
    const { weather, loading, error, searchLocation } = useWeather();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on Outside Click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            searchLocation(searchQuery);
            setSearchQuery('');
        }
    };

    if (!weather && loading) return <div className="w-16 h-8 bg-white/10 animate-pulse rounded-full" />;

    return (
        <div className="relative" ref={popoverRef}>
            {/* Compact Header Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white"
                title="Ver clima"
            >
                {weather && (
                    <>
                        {getWeatherIcon(weather.current.weatherCode, weather.current.isDay)}
                        <span className="text-sm font-semibold">{weather.current.temp}°</span>
                        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
                    </>
                )}
            </button>

            {/* Expanded Forecast Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-72 bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[110] overflow-hidden"
                    >
                        {/* Header / Location Search */}
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder={weather?.locationName || "Buscar ciudad..."}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6699ff] transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                            </form>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400 px-1">
                                <MapPin size={10} />
                                <span>{weather?.locationName || 'Saladillo, Argentina'}</span>
                            </div>
                        </div>

                        {/* Forecast Body */}
                        <div className="p-4 space-y-4">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Pronóstico 3 Días</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {weather?.forecast.map((day, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getWeatherIcon(day.weatherCode)}
                                            <div className="flex items-center gap-2 min-w-[60px] justify-end">
                                                <span className="text-xs font-bold text-white">{day.maxTemp}°</span>
                                                <span className="text-xs text-gray-500">{day.minTemp}°</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && <div className="px-4 py-2 bg-red-500/20 text-red-400 text-[10px] text-center">{error}</div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Tooltip helper
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

export default WeatherWidget;
