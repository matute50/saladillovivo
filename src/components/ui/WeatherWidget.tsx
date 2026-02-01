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
    ChevronDown
} from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNewsStore } from '@/store/useNewsStore';

// Mapping WeatherAPI codes to Icons
// https://www.weatherapi.com/docs/weather_conditions.json
const getWeatherIcon = (code: number, isDay: boolean = true) => {
    // Sunny / Clear
    if (code === 1000) {
        return isDay
            ? <Sun size={30} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
            : <Moon size={30} className="text-indigo-200 drop-shadow-[0_0_8px_rgba(199,210,254,0.3)]" />;
    }

    // Part cloudy (1003)
    if (code === 1003) return <Cloud size={30} className={cn(isDay ? "text-sky-300" : "text-slate-400")} />;

    // Cloudy / Overcast (1006, 1009)
    if (code === 1006 || code === 1009) return <Cloud size={30} className="text-slate-400" />;

    // Mist, Fog (1030, 1135, 1147)
    if (code === 1030 || code === 1135 || code === 1147) return <CloudFog size={30} className="text-slate-300/80" />;

    // Patchy rain, light drizzle (1063, 1150, 1153, 1180, 1183)
    if ([1063, 1150, 1153, 1180, 1183].includes(code)) return <CloudDrizzle size={30} className="text-cyan-400" />;

    // Moderate/Heavy Rain (1186, 1189, 1192, 1195, 1240, 1243, 1246)
    if ([1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
        return <CloudRain size={30} className="text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]" />;
    }

    // Snow (1066, 1114, 1117, 1210-1225, 1255-1258)
    if (code >= 1210 && code <= 1258 || [1066, 1114, 1117].includes(code)) return <CloudSnow size={30} className="text-blue-50" />;

    // Thundery outbreaks (1087, 1273, 1276, 1279, 1282)
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
        return <CloudLightning size={30} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />;
    }

    return <Wind size={30} className="text-teal-300" />;
};

const WeatherWidget = () => {
    const { weather, loading, error, searchLocation } = useWeather();
    const isDarkTheme = useNewsStore(state => state.isDarkTheme);
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
                className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-full transition-all border",
                    isDarkTheme
                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                        : "bg-black/5 hover:bg-black/10 border-black/10 text-black"
                )}
                title="Ver clima"
            >
                {weather && (
                    <>
                        {getWeatherIcon(weather.current.conditionCode, weather.current.isDay)}
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-lg font-bold">{weather.current.temp}°</span>
                            <span className={cn(
                                "text-[10px] opacity-70",
                                isDarkTheme ? "text-gray-300" : "text-gray-600"
                            )}>ST {weather.current.feelsLike}°</span>
                        </div>
                        <ChevronDown size={21} className={cn("transition-transform ml-1", isOpen && "rotate-180")} />
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
                        className={cn(
                            "absolute right-0 mt-3 w-72 backdrop-blur-xl border rounded-2xl shadow-2xl z-[110] overflow-hidden",
                            isDarkTheme
                                ? "bg-gray-900/90 border-white/20"
                                : "bg-white/95 border-black/10"
                        )}
                    >
                        {/* Header / Location Search */}
                        <div className={cn(
                            "p-4 border-b",
                            isDarkTheme ? "border-white/10 bg-white/5" : "border-black/5 bg-black/5"
                        )}>
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder={weather?.locationName || "Buscar ciudad..."}
                                    className={cn(
                                        "w-full border rounded-xl py-2 pl-9 pr-4 text-xs transition-all focus:outline-none",
                                        isDarkTheme
                                            ? "bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-[#6699ff]"
                                            : "bg-white/60 border-black/10 text-black placeholder:text-gray-400 focus:border-blue-500"
                                    )}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className={cn("absolute left-3 top-2.5", isDarkTheme ? "text-gray-500" : "text-gray-400")} size={21} />
                            </form>
                            <div className={cn(
                                "mt-2 flex items-center gap-1 text-xs px-1",
                                isDarkTheme ? "text-gray-400" : "text-gray-500"
                            )}>
                                <MapPin size={15} />
                                <span>{weather?.locationName || 'Saladillo, Argentina'}</span>
                                <span className="ml-auto text-[10px] italic">WeatherAPI</span>
                            </div>
                        </div>

                        {/* Forecast Body */}
                        <div className="p-4 space-y-4">
                            <h3 className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-1",
                                isDarkTheme ? "text-gray-400" : "text-gray-500"
                            )}>
                                Pronóstico 3 Días
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {weather?.forecast.map((day, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border",
                                            isDarkTheme
                                                ? "bg-white/5 border-white/5"
                                                : "bg-black/5 border-black/5"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-[10px] font-medium",
                                                isDarkTheme ? "text-gray-400" : "text-gray-500"
                                            )}>
                                                {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-end mr-1">
                                                {getWeatherIcon(day.conditionCode)}
                                                <span className="text-[8px] mt-1 opacity-60 text-center truncate max-w-[50px]">
                                                    {day.conditionText}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 min-w-[60px] justify-end">
                                                <span className={cn(
                                                    "text-xs font-bold",
                                                    isDarkTheme ? "text-white" : "text-black"
                                                )}>
                                                    {day.maxTemp}°
                                                </span>
                                                <span className={cn(
                                                    "text-xs",
                                                    isDarkTheme ? "text-gray-500" : "text-gray-400"
                                                )}>
                                                    {day.minTemp}°
                                                </span>
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

export default WeatherWidget;
