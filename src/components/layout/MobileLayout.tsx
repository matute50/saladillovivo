'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useMediaPlayer } from '@/context/MediaPlayerContext';
import VideoSection from './VideoSection';
import { PageData, Video, Article } from '@/lib/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Controller } from 'swiper/modules';
import { Play, ChevronLeft, ChevronRight, Info, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Swiper as SwiperClass } from 'swiper';

import 'swiper/css';

// --- DATOS MOCK ROBUSTOS (Para evitar error de loop) ---
const MOCK_DATA = {
  articles: {
    featuredNews: { id: '1', titulo: '¡Diseño Móvil Activo!', bajada: 'Si ves esto, el código funciona.', imagen: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', categoria: 'SISTEMA', autor: 'Admin', fecha: 'Hoy', contenido: '', etiquetas: [] },
    secondaryNews: [
      { id: '2', titulo: 'Noticia Local A', bajada: '', imagen: '', categoria: 'LOCAL', autor: '', fecha: '', contenido: '', etiquetas: [] },
      { id: '3', titulo: 'Deportes B', bajada: '', imagen: '', categoria: 'DEPORTES', autor: '', fecha: '', contenido: '', etiquetas: [] },
      { id: '4', titulo: 'Cultura C', bajada: '', imagen: '', categoria: 'CULTURA', autor: '', fecha: '', contenido: '', etiquetas: [] },
      { id: '5', titulo: 'Policiales D', bajada: '', imagen: '', categoria: 'POLICIALES', autor: '', fecha: '', contenido: '', etiquetas: [] }
    ],
    otherNews: []
  },
  videos: {
    allVideos: [],
    liveStream: null
  },
  // Duplicamos datos para que el carrusel infinito no se queje
  ads: [
    { id: 'ad1', cliente: 'Cliente A', imagen_url: '', url: '', tipo: 'banner', fecha_inicio: '', fecha_fin: '', activo: true },
    { id: 'ad2', cliente: 'Cliente B', imagen_url: '', url: '', tipo: 'banner', fecha_inicio: '', fecha_fin: '', activo: true },
    { id: 'ad3', cliente: 'Cliente C', imagen_url: '', url: '', tipo: 'banner', fecha_inicio: '', fecha_fin: '', activo: true },
    { id: 'ad4', cliente: 'Cliente A Repetido', imagen_url: '', url: '', tipo: 'banner', fecha_inicio: '', fecha_fin: '', activo: true },
    { id: 'ad5', cliente: 'Cliente B Repetido', imagen_url: '', url: '', tipo: 'banner', fecha_inicio: '', fecha_fin: '', activo: true }
  ]
};

function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isLandscape;
}

// Subcomponente separado para limpieza
function MobileNewsCard({ news, isFeatured, onClick }: { news: any; isFeatured: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm shrink-0",
        isFeatured ? "w-full h-full" : "w-[49%] h-full"
      )}
    >
      <div className="relative w-full h-full">
        <Image
          src={news.imagen || '/placeholder.png'}
          alt={news.titulo || 'Noticia'}
          fill
          priority={isFeatured} 
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full border border-white/30 backdrop-blur-sm z-10">
          <Play size={isFeatured ? 32 : 20} fill="white" className="text-white" />
        </div>

        <div className="absolute bottom-0 left-0 p-2 w-full z-20">
          <h3 className={cn("font-bold text-white leading-tight line-clamp-2", isFeatured ? "text-lg mb-1" : "text-xs mb-0.5")}>
            {news.titulo}
          </h3>
          {isFeatured ? (
             <p className="text-xs text-gray-300 line-clamp-2 font-light">{news.bajada}</p>
          ) : (
             <span className="text-[10px] text-orange-400 font-medium uppercase tracking-wider">{news.categoria}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoCarouselBlock({ videos, categories }: { videos: any[]; categories: string[] }) {
  const { playSpecificVideo } = useMediaPlayer();
  const [activeCat, setActiveCat] = useState(categories[0]);

  const filtered = useMemo(() => {
    return activeCat === 'TODOS' ? videos : videos.filter(v => v.categoria === activeCat);
  }, [videos, activeCat]);

  return (
    <div className="flex flex-col gap-2 h-full w-full">
      <div className="flex overflow-x-auto gap-2 px-2 scrollbar-hide py-1 shrink-0">
        <button onClick={() => setActiveCat('TODOS')} className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors", activeCat === 'TODOS' ? "bg-orange-600 text-white" : "bg-neutral-800 text-gray-300")}>TODOS</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)} className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors", activeCat === cat ? "bg-orange-600 text-white" : "bg-neutral-800 text-gray-300")}>{cat}</button>
        ))}
      </div>

      <Swiper slidesPerView={2.2} spaceBetween={10} className="w-full flex-1">
        {filtered.map((video) => (
          <SwiperSlide key={video.id} className="h-full">
             <div onClick={() => playSpecificVideo(video)} className="relative h-full w-full rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700/50">
                <Image src={video.imagen || '/placeholder.png'} alt={video.nombre} fill className="object-cover opacity-90" />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play size={24} fill="white" className="text-white drop-shadow-md" />
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight text-center">{video.nombre}</p>
                 </div>
             </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default function MobileLayout({ data, isMobile }: { data: PageData; isMobile: boolean }) {
  const safeData = data || MOCK_DATA;
  const { articles, videos, ads } = safeData as PageData;
  const isLandscape = useOrientation();
  
  const [newsSwiper, setNewsSwiper] = useState<SwiperClass | null>(null);
  const [adsSwiper, setAdsSwiper] = useState<SwiperClass | null>(null);

  // Preparar Noticias
  const newsSlides = useMemo(() => {
    const slides = [];
    if (articles?.featuredNews) {
        slides.push({ type: 'featured', items: [articles.featuredNews] });
    }
    const secondary = [...(articles?.secondaryNews || []), ...(articles?.otherNews || [])];
    for (let i = 0; i < secondary.length; i += 2) {
      slides.push({ type: 'pair', items: secondary.slice(i, i + 2) });
    }
    return slides;
  }, [articles]);

  // Preparar Ads (Logica simplificada para evitar crash)
  const adsSlides = useMemo(() => {
    if (!ads || ads.length === 0) return [];
    
    // Asegurar minimo 4 slides para loop
    let res = [...ads];
    while (res.length < 4) {
       res = [...res, ...ads];
    }
    
    // Sincronizar con noticias si es posible
    if (newsSlides.length > 0) {
        const target = newsSlides.length;
        while (res.length < target) {
            res = [...res, ...ads]; // Rellenar
        }
        return res.slice(0, target);
    }
    return res;
  }, [ads, newsSlides.length]);

  if (isLandscape) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
         <div className="w-full h-full">
            <VideoSection isMobile={true} isMobileFixed={false} />
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col w-full h-[100dvh] bg-black text-foreground overflow-y-auto">
      
      {/* HEADER */}
      <header className="shrink-0 h-12 flex items-center justify-center bg-black border-b border-white/10 z-20 sticky top-0">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-orange-600 rounded-sm flex items-center justify-center">
               <Play size={12} fill="white" className="text-white" />
             </div>
             <span className="font-bold text-white tracking-widest text-sm">SALADILLO VIVO</span>
          </div>
      </header>

      {/* PLAYER */}
      <div className="shrink-0 sticky top-12 z-30 w-full bg-black shadow-xl border-b border-white/5">
        <VideoSection isMobile={true} isMobileFixed={false} />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col gap-4 p-3 pb-20">
        
        {/* BLOQUE 1: NOTICIAS */}
        <div className="w-full aspect-[16/8] min-h-[180px] shrink-0">
          <Swiper
            modules={[Controller]}
            onSwiper={setNewsSwiper}
            controller={{ control: adsSwiper }}
            spaceBetween={10}
            slidesPerView={1}
            className="h-full w-full rounded-xl"
          >
            {newsSlides.map((slide, index) => (
              <SwiperSlide key={`news-${index}`}>
                 <div className="w-full h-full flex justify-between">
                    {slide.items.map((item) => (
                      <MobileNewsCard 
                        key={item.id} 
                        news={item} 
                        isFeatured={slide.type === 'featured'}
                        onClick={() => console.log("Click", item.titulo)} 
                      />
                    ))}
                 </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* BLOQUE 2: TV */}
        <div className="flex-1 min-h-[160px] flex flex-col">
            <div className="flex justify-between items-center mb-1 px-1">
               <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Explorar TV</h3>
               <div className="flex gap-1">
                 <ChevronLeft size={16} className="text-muted-foreground" />
                 <ChevronRight size={16} className="text-muted-foreground" />
               </div>
            </div>
            <div className="flex-1 bg-neutral-900/30 rounded-xl p-2 border border-white/5">
               <VideoCarouselBlock 
                  videos={videos?.allVideos || []} 
                  categories={['Destacados', 'Noticias', 'Deportes', 'Sociales', 'Política']} 
               />
            </div>
        </div>

        {/* BLOQUE 3: ADS (Loop Infinito) */}
        <div className="w-full h-16 shrink-0 mt-2">
           <Swiper
             modules={[Controller]}
             onSwiper={setAdsSwiper}
             controller={{ control: newsSwiper }}
             spaceBetween={10}
             slidesPerView={1}
             loop={true}
             className="h-full w-full"
           >
              {adsSlides.map((ad, idx) => (
                 <SwiperSlide key={`ad-${idx}`}>
                    <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/10 bg-black">
                       <Image src={ad.imagen_url || '/placeholder_ad.png'} alt="Publicidad" fill className="object-cover" />
                       <div className="absolute top-0 right-0 bg-black/60 px-1 rounded-bl text-[8px] text-white/70">PUBLICIDAD</div>
                    </div>
                 </SwiperSlide>
              ))}
           </Swiper>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="shrink-0 py-4 bg-neutral-950 border-t border-white/10 flex flex-col items-center justify-center gap-2 text-[10px] text-neutral-500">
         <div className="flex gap-4">
            <a href="#" className="flex items-center gap-1 hover:text-white"><FileText size={12} /> Decreto H.C.D</a>
            <a href="#" className="flex items-center gap-1 hover:text-white"><Info size={12} /> Matias Vidal</a>
         </div>
         <p>© 2026 Saladillo Vivo</p>
      </footer>
    </div>
  );
}