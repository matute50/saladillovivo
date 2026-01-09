// src/components/layout/MobileLayout.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useNews } from '@/context/NewsContext';
import MediaPlayerWrapper from '../MediaPlayerWrapper';
import CategoryList from '../CategoryList';
import NewsCard from '../NewsCard';
import { Card } from '@/components/ui/card'; // Asumiendo que esta es la ruta para el componente Card
import { useOrientation } from '@/hooks/useOrientation'; // Importar el hook de orientación
import { Article } from '@/lib/types';

// Interfaz para el contenido mixto
interface MixedContentItem {
  type: 'article' | 'ad';
  data: Article | AdData;
}

// Interfaz para los datos de la publicidad
interface AdData {
    id: string;
    imageUrl: string;
    linkUrl: string;
    title: string;
    // Agrega otras propiedades que pueda tener una publicidad
}

// Mock de publicidades - Estas deberían venir de alguna fuente real en una implementación completa
const MOCK_ADS: AdData[] = [
    { id: 'ad1', imageUrl: 'https://via.placeholder.com/300x150?text=Publicidad+1', linkUrl: 'https://ejemplo.com/ad1', title: 'Anuncio Impactante' },
    { id: 'ad2', imageUrl: 'https://via.placeholder.com/300x150?text=Publicidad+2', linkUrl: 'https://ejemplo.com/ad2', title: 'Oferta Especial' },
    { id: 'ad3', imageUrl: 'https://via.placeholder.com/300x150?text=Publicidad+3', linkUrl: 'https://ejemplo.com/ad3', title: 'Descubre Más' },
    { id: 'ad4', imageUrl: 'https://via.placeholder.com/300x150?text=Publicidad+4', linkUrl: 'https://ejemplo.com/ad4', title: 'Última Oportunidad' },
];

const MobileLayout = () => {
    const { currentVideo, viewMode, setViewMode } = useMediaPlayer();
    // Asumo que allNews contiene la lista de artículos/noticias
    const { allNews, isLoading: isLoadingNews } = useNews(); 
    const orientation = useOrientation(); // Obtener la orientación actual

    const playerRef = useRef<HTMLDivElement>(null); // Referencia al contenedor del reproductor

    // Efecto para manejar el Fullscreen en Landscape
    useEffect(() => {
        // Solo aplicar en modo 'mobile' (cuando MobileLayout está activo)
        // y si hay un video reproduciéndose
        if (orientation === 'landscape' && currentVideo && currentVideo.url) {
            // Lógica para activar el fullscreen.
            // La implementación real del fullscreen debe estar en MediaPlayerWrapper o en el reproductor.
            // Aquí se asume que el MediaPlayerWrapper o el reproductor puede detectar o ser instruido
            // para ir a Fullscreen.
            // Por ejemplo, podríamos necesitar una función como playFullscreen() en MediaPlayerContext
            // o que MediaPlayerWrapper responda a un estado global/contexto.
            console.log("Orientación Landscape detectada, intentando Fullscreen para el video.");
            // Si el reproductor tiene un método para activar el fullscreen:
            // if (videoPlayerRef.current && videoPlayerRef.current.requestFullscreen) {
            //     videoPlayerRef.current.requestFullscreen();
            // }
            // O si es un componente de React que maneja su propio fullscreen:
            // setCurrentVideoFullscreen(true); // Ejemplo de un estado para controlar el fullscreen
        } else if (orientation === 'portrait') {
            console.log("Orientación Portrait detectada, saliendo de Fullscreen si estaba activo.");
            // Si el reproductor tiene un método para salir del fullscreen:
            // if (document.fullscreenElement) {
            //     document.exitFullscreen();
            // }
            // setCurrentVideoFullscreen(false); // Ejemplo de un estado para controlar el fullscreen
        }
    }, [orientation, currentVideo]); // Dependencias: orientación y video actual

    // Lógica Zipper para mezclar noticias y publicidades
    const getMixedContent = useCallback((articles: Article[], ads: AdData[], adInterval: number = 3): MixedContentItem[] => {
        const result: MixedContentItem[] = [];
        let adIndex = 0;

        articles.forEach((article, index) => {
            result.push({ type: 'article', data: article });
            // Inyectar publicidad cada 'adInterval' artículos
            if ((index + 1) % adInterval === 0 && ads.length > 0) {
                result.push({ type: 'ad', data: ads[adIndex % ads.length] });
                adIndex++;
            }
        });
        return result;
    }, []);

    // Memoizar el contenido mixto para evitar recálculos innecesarios
    const mixedContent = useMemo(() => {
        if (isLoadingNews || !allNews || allNews.length === 0) {
            return [];
        }
        return getMixedContent(allNews, MOCK_ADS);
    }, [allNews, isLoadingNews, getMixedContent]);


    // Establecer el viewMode a 'diario' para móvil si aún no está.
    // Esto es importante para asegurar que el MediaPlayerContext sepa que está en modo móvil.
    useEffect(() => {
        if (viewMode !== 'diario') { // 'diario' es el equivalente a móvil/desktop normal
            setViewMode('diario');
        }
    }, [viewMode, setViewMode]);


    return (
        <div className="relative flex flex-col h-screen w-screen bg-gray-900 overflow-y-auto">
            {/* Bloque Superior (Player) - Sticky/Fijo */}
            <div ref={playerRef} className="sticky top-0 z-50 w-full bg-black">
                <MediaPlayerWrapper />
            </div>

            {/* Bloque Intermedio (Navegación de Categorías) */}
            <div className="w-full py-2 bg-gray-800 shadow-md">
                {/* CategoryList es un componente que renderiza las categorías.
                    Asegúrate de que CategoryList pueda manejar la propiedad isMobile
                    para ajustar su comportamiento (ej. scroll horizontal). */}
                <CategoryList isMobile={true} /> 
            </div>

            {/* Bloque Inferior (Contenido Mixto) */}
            <div className="flex-grow overflow-y-auto p-4 bg-gray-900">
                <h2 className="text-xl font-bold text-white mb-4">Noticias y Publicidad</h2>
                {isLoadingNews ? (
                    <div className="text-white text-center">Cargando noticias...</div>
                ) : (
                    <div className="flex overflow-x-scroll snap-x snap-mandatory pb-4 scrollbar-hide space-x-4">
                        {mixedContent.map((item, index) => (
                            <div key={index} className="flex-shrink-0 w-[85vw] snap-center"> {/* w-[85vw] para que no ocupe todo el ancho y permita el snap */}
                                {item.type === 'article' ? (
                                    // Asegúrate de que NewsCard acepte y maneje la propiedad isMobile si es necesario
                                    <NewsCard article={item.data as Article} isMobile={true} />
                                ) : (
                                    <a href={(item.data as AdData).linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                                        <Card className="flex flex-col items-center justify-center h-full w-full bg-blue-700 text-white rounded-lg shadow-lg p-4">
                                            <h3 className="text-lg font-bold">{(item.data as AdData).title}</h3>
                                            <p className="text-sm">Publicidad</p>
                                            {/* Si quieres mostrar la imagen de la publicidad */}
                                            {/* <img src={(item.data as AdData).imageUrl} alt={(item.data as AdData).title} className="mt-2 max-h-24 object-contain" /> */}
                                        </Card>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileLayout;
