"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { CheckCircle, CheckIcon, Music, Pen, Play, PlayCircle, Plus, PlusCircle, PlusIcon, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "./ui/context-menu";
import { MusicData } from "@/types/music";
import ApiService from "@/services/api.service";
import { toast } from "sonner";
import { useSelectedChannelId } from "@/hooks/use-selected-channel-id";
import axios from "axios";
import { useCurrentMusic } from "@/hooks/use-current-music";

type Props = {
    music: MusicData;
    guild_id: string;
    onUpdateMusic: (data: MusicData[]) => void;
}

export default function MusicCard(props: Props) {
    const { selectedChannelId } = useSelectedChannelId();
    const { setCurrentMusic } = useCurrentMusic();

    async function playMusic() {
        if (!selectedChannelId) {
            toast.error(`Impossible de jouer la musique`, {
                description: `Vous devez choisir un salon vocal.`
            });
            return;
        }

        try {
            await ApiService.playMusic(props.guild_id, selectedChannelId, props.music.hash)
            toast.success(`En train de jouer`, { description: decodeURI(props.music.name) });
            setCurrentMusic(props.music);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Erreur lors de la lecture de la musique :", err);
                toast.error(`Impossible de jouer la musique`, { description: err.response?.data.err_message });
            } else {
                toast.error("Erreur inattendue", { description: (err as Error).message });
            }
        }
    }

    async function deleteMusic() {
        try {
            const response = await ApiService.deleteMusic(props.guild_id as string, props.music.hash)
            toast.success(`Supprimé`, { description: "La musique a été supprimé." });
            props.onUpdateMusic(response.data)
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Erreur lors de la suppression de la musique :", err);
                toast.error(`Impossible de supprimer la musique`, { description: err.response?.data.err_message });
            } else {
                toast.error("Erreur inattendue", { description: (err as Error).message });
            }
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="p-2 border-2 max-w-[350px] cursor-pointer hover:bg-accent transition-colors duration-[.1s]">
                            <CardContent className="flex items-center gap-2 p-2" onClick={playMusic}>
                                <PlusIcon className="min-w-[24px]" />
                                <div className="flex flex-col w-[calc(100%-24px)]">
                                    <p className="truncate">{decodeURI(props.music.name)}</p>
                                    <span className="text-sm text-gray-400">Music author</span>
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>{decodeURI(props.music.name)}</TooltipContent>
                </Tooltip>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={playMusic}>
                    <Play />
                    Jouer
                </ContextMenuItem>
                <ContextMenuItem>
                    <Plus />
                    Ajouter à la file
                </ContextMenuItem>
                <ContextMenuItem>
                    <Pen />
                    Renommer
                </ContextMenuItem>
                <ContextMenuItem variant="destructive" onClick={deleteMusic}>
                    <Trash />
                    Supprimer
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}