"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AddMusicDialog from "./add-music-dialog";
import { MusicData } from "@/types/music";
import { TooltipProvider } from "./ui/tooltip";
import MusicCard from "./music-card";

type Props = {
    musics: MusicData[] | undefined
}

export default function JukeboxFeaturePage(props: Props) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [musics, setMusics] = useState<MusicData[] | undefined>(props.musics);
    const [filteredMusics, setFilteredMusics] = useState<MusicData[] | undefined>(musics);

    const { guild_id } = useParams();

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
                <AddMusicDialog guildId={guild_id as string} onUpdateMusic={setMusics} />
                <Input placeholder="Rechercher" onChange={(e) => setSearchQuery(e.target.value)} />
            </CardHeader>
            <TooltipProvider>
                <CardContent className="flex flex-wrap gap-2 overflow-auto">
                    {filteredMusics ?
                        filteredMusics.length > 0 ?
                            filteredMusics.map((music, index) => (
                                <MusicCard key={index} music={music} guild_id={guild_id as string} onUpdateMusic={setMusics} />
                            )) : <p>Aucune musique n'a encore été ajouté à ce serveur.</p>
                        : <p>Oups, on dirait que le bot est actuellement indisponible :/</p>}
                </CardContent>
            </TooltipProvider>
        </Card >
    )
}
