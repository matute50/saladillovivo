'use client';

import { useMediaPlayer } from '@/context/MediaPlayerContext';
import { useThemeButtonColors } from '@/hooks/useThemeButtonColors';
import { useToast } from '@/components/ui/use-toast';
import React, { useRef, useState } from 'react';

// ...

const ExclusiveVideoCarousel: React.FC<ExclusiveVideoCarouselProps> = ({ videos, isLoading, carouselId, isMobile = false, isLive = false }) => {
  const { playSpecificVideo, playLiveStream, streamStatus } = useMediaPlayer();
  const { toast } = useToast();
  const swiperRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { buttonColor, buttonBorderColor } = useThemeButtonColors();