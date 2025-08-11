"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import AddMusicDialog from "./add-music-dialog";
import { TooltipProvider } from "./ui/tooltip";
import MusicCard from "./music-card";
import { Music } from "@jukebot/types";
import WSService from "@/services/ws.service";
import ApiService from "@/services/api.service";

type Props = {
    guildId: string,
}

export default function JukeboxFeaturePage(props: Props) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [musics, setMusics] = useState<Music[]>([]);
    const [filteredMusics, setFilteredMusics] = useState<Music[] | undefined>(musics);

    useEffect(() => {
        ApiService.getMusics(props.guildId).then((res) => setMusics(res.data))

        const onMusicAdded = (music: Music) => setMusics(prev => [...prev, music])
        const onMusicRemoved = (music: Music) => setMusics(prev => prev.filter(m => m.hash !== music.hash))
        WSService.wsEvents.on("music_added", onMusicAdded)
        WSService.wsEvents.on("music_removed", onMusicRemoved)

        return () => {
            WSService.wsEvents.off("music_added", onMusicAdded)
            WSService.wsEvents.off("music_removed", onMusicRemoved)
        }
    }, [])

    useEffect(() => {
        filterMusics(searchQuery)
    }, [musics, searchQuery])

    function filterMusics(query: string) {
        if (!musics)
            return;

        const normalizedQuery = query.trim().toLowerCase();

        if (normalizedQuery === "")
            return setFilteredMusics(musics);

        const filtered = musics.filter((music) =>
            music.name.toLowerCase().includes(normalizedQuery)
        );

        setFilteredMusics(filtered);
    };

    return (
        <Card className="flex-1 overflow-auto">
            <CardHeader className="flex">
                <AddMusicDialog guildId={props.guildId} />
                <Input placeholder="Rechercher" onChange={(e) => setSearchQuery(e.target.value)} />
            </CardHeader>
            <TooltipProvider>
                <CardContent className="flex flex-wrap gap-2 overflow-auto">
                    {filteredMusics ?
                        filteredMusics.length > 0 ?
                            filteredMusics.map((music, index) => (
                                <MusicCard key={index} music={music} guildId={props.guildId} />
                            )) : <p>Aucune musique n'a encore été ajouté à ce serveur.</p>
                        : <p>Oups, on dirait que le bot est actuellement indisponible :/</p>}
                </CardContent>
            </TooltipProvider>
        </Card >
    )
}
