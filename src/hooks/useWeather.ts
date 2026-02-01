'use client';

import { useState, useEffect, useCallback } from 'react';

const DEFAULT_COORDS = { lat: -34.636, lon: -59.778 }; // Saladillo, Buenos Aires
const SALADILLO_NAME = 'Saladillo, BA';
const WEATHER_CACHE_KEY = 'saladillovivo_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export interface WeatherData {
    current: {
        temp: number;
        weatherCode: number;
        isDay: boolean;
    };
    forecast: Array<{
        date: string;
        minTemp: number;
        maxTemp: number;
        weatherCode: number;
    }>;
    locationName: string;
}

export const useWeather = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = useCallback(async (lat: number, lon: number, name: string) => {
        try {
            setLoading(true);
            // Open-Meteo API
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener datos del clima');

            const data = await response.json();

            const weatherData: WeatherData = {
                current: {
                    temp: Math.round(data.current.temperature_2m),
                    weatherCode: data.current.weather_code,
                    isDay: !!data.current.is_day,
                },
                forecast: data.daily.time.slice(1, 4).map((time: string, index: number) => ({
                    date: time,
                    maxTemp: Math.round(data.daily.temperature_2m_max[index + 1]),
                    minTemp: Math.round(data.daily.temperature_2m_min[index + 1]),
                    weatherCode: data.daily.weather_code[index + 1],
                })),
                locationName: name,
            };

            setWeather(weatherData);
            localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
                data: weatherData,
                timestamp: Date.now(),
                lat,
                lon
            }));
            setError(null);
        } catch (err) {
            console.error('Weather Fetch Error:', err);
            setError('No se pudo cargar el clima');
        } finally {
            setLoading(false);
        }
    }, []);

    const reverseGeocode = async (lat: number, lon: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
            const data = await res.json();
            return data.address.city || data.address.town || data.address.village || 'Ubicación Actual';
        } catch {
            return 'Ubicación Actual';
        }
    };

    const updateLocation = async (lat: number, lon: number, name?: string) => {
        const finalName = name || await reverseGeocode(lat, lon);
        fetchWeather(lat, lon, finalName);
    };

    const searchLocation = async (query: string) => {
        try {
            setLoading(true);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await res.json();
            if (data && data[0]) {
                const { lat, lon, display_name } = data[0];
                const shortName = display_name.split(',')[0];
                updateLocation(parseFloat(lat), parseFloat(lon), shortName);
            } else {
                setError('Ubicación no encontrada');
                setLoading(false);
            }
        } catch {
            setError('Error al buscar ubicación');
            setLoading(false);
        }
    };

    useEffect(() => {
        const initWeather = async () => {
            // 1. Try Cache
            const cached = localStorage.getItem(WEATHER_CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setWeather(data);
                    setLoading(false);
                    return;
                }
            }

            // 2. Try Geolocation
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        updateLocation(latitude, longitude);
                    },
                    () => {
                        // Fallback to Saladillo if declined
                        fetchWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, SALADILLO_NAME);
                    }
                );
            } else {
                // Fallback to Saladillo if not supported
                fetchWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, SALADILLO_NAME);
            }
        };

        initWeather();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { weather, loading, error, updateLocation, searchLocation };
};
