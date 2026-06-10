import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type SlideType = 'html' | 'video' | 'image';

export interface SlideData {
    url: string;
    type: SlideType;
    duration?: number;
    title?: string;
    subtitle?: string;
    audioUrl?: string | null;
    /** P2-fix: true si el HTML ya embebe su propio <audio>. En ese caso VideoSection omite el <audio> externo. */
    embedsAudio?: boolean;
}


interface NewsPlayerState {
    currentSlide: SlideData | null;
    isPlaying: boolean;
    isNewsIntroActive: boolean;
    playSlide: (slide: SlideData) => void;
    stopSlide: () => void;
    setIsNewsIntroActive: (active: boolean) => void;
}

export const useNewsPlayerStore = create<NewsPlayerState>()(
    devtools(
        (set) => ({
            currentSlide: null,
            isPlaying: false,
            isNewsIntroActive: false,
            playSlide: (slide) => {
                const normalizedSlide = {
                    ...slide,
                    audioUrl: slide.audioUrl === undefined ? null : slide.audioUrl
                };
                console.log('[NewsPlayerStore] playSlide invocado con:', normalizedSlide);
                set({ currentSlide: normalizedSlide, isPlaying: true, isNewsIntroActive: true });
            },
            stopSlide: () => set({ currentSlide: null, isPlaying: false, isNewsIntroActive: false }),
            setIsNewsIntroActive: (active) => set({ isNewsIntroActive: active }),
        }),
        { name: 'NewsPlayerStore' }
    )
);
