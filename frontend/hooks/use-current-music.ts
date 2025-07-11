import { MusicData } from "@/types/music";
import { create } from "zustand"

type CurrentMusic = {
    currentMusic: MusicData | undefined,
    setCurrentMusic: (musicData: MusicData) => void;
}

export const useCurrentMusic = create<CurrentMusic>((set) => ({
    currentMusic: undefined,
    setCurrentMusic: (value) => set({ currentMusic: value })
}))