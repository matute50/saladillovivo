'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useThemeButtonColors } from '@/hooks/useThemeButtonColors';
import { useToast } from '@/components/ui/use-toast';

// Define the Video type assuming it's available globally or imported elsewhere
// For now, I'll define a basic type to avoid compilation errors here.
type Video = {
  id: string;
  url: string;
  imagen: string;
  nombre: string;
  isLiveThumbnail?: boolean;
  isEvent?: boolean;
};

// Define ExclusiveVideoCarouselProps
interface ExclusiveVideoCarouselProps {
  videos: Video[];
  isLoading: boolean;
  carouselId: string;
  isMobile?: boolean;
  isLive?: boolean;
}

const ExclusiveVideoCarousel: React.FC<ExclusiveVideoCarouselProps> = ({ videos, isLoading, carouselId, isMobile = false, isLive = false }) => {
  const { playSpecificVideo, playLiveStream, streamStatus } = useMediaPlayer();
  const { toast } = useToast();
  const swiperRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { buttonColor, buttonBorderColor } = useThemeButtonColors();