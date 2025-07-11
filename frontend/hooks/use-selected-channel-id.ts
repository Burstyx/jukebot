import { create } from "zustand"

type SelectedChannelId = {
    selectedChannelId: string | undefined,
    setSelectedChannelId: (channelId: string) => void;
}

export const useSelectedChannelId = create<SelectedChannelId>((set) => ({
    selectedChannelId: undefined,
    setSelectedChannelId: (value) => set({ selectedChannelId: value })
}))