import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface VolumeState {
    volume: number;
    isMuted: boolean;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    unmute: () => void;
}

export const useVolumeStore = create<VolumeState>()(
    devtools(
        persist(
            (set) => ({
                volume: 1,
                isMuted: true,
                setVolume: (newVolume) => {
                    const clamped = Math.max(0, Math.min(1, newVolume));
                    set({ volume: clamped });
                    if (clamped > 0) set({ isMuted: false });
                },
                toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
                unmute: () => set({ isMuted: false }),
            }),
            {
                name: 'player-volume',
            }
        ),
        { name: 'VolumeStore' }
    )
);
