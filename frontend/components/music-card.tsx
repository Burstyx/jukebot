"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Pen, Play, Plus, PlusIcon, Trash } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import ApiService from "@/services/api.service";
import { toast } from "sonner";
import axios from "axios";
import { Music } from "@jukebot/types";

type Props = {
  music: Music;
  guildId: string;
};

export default function MusicCard(props: Props) {
  async function addMusicToQueue() {
    await ApiService.addToQueue(props.guildId, props.music.hash);
    toast.success(`Ajouté à la file`, {
      description: decodeURI(props.music.name),
    });
  }

  async function deleteMusic() {
    try {
      await ApiService.deleteMusic(props.guildId, props.music.hash);
      toast.success(`Supprimé`, { description: "La musique a été supprimé." });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Erreur lors de la suppression de la musique :", err);
        toast.error(`Impossible de supprimer la musique`, {
          description: err.response?.data.err_message,
        });
      } else {
        toast.error("Erreur inattendue", {
          description: (err as Error).message,
        });
      }
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className="p-2 border-2 max-w-[350px] cursor-pointer hover:bg-accent transition-colors duration-[.1s]"
              onClick={addMusicToQueue}
            >
              <CardContent className="flex items-center gap-2 p-2">
                <PlusIcon className="min-w-[24px]" />
                <div className="flex flex-col w-[calc(100%-24px)]">
                  <p className="truncate">{decodeURI(props.music.name)}</p>
                  <span className="text-sm text-gray-400">
                    {props.music.author}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>{decodeURI(props.music.name)}</TooltipContent>
        </Tooltip>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={addMusicToQueue}>
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
  );
}
