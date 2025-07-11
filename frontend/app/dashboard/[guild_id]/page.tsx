"use client"

import DashboardSidebar from "@/components/dashboard-sidebar";
import JukeboxFeaturePage from "@/components/jukebox-feature-page";
import { getEnvVar } from "@/config/constants";
import ApiService from "@/services/api.service";
import { Channel } from "@/types/channel";
import { MusicData } from "@/types/music";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Page() {
    const { guild_id } = useParams()

    let musics: MusicData[] | undefined = [];
    let channels: Channel[] | undefined = [];

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://127.0.0.1:5000/${guild_id}`)
        socketRef.current = socket

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "hello"
            }))
        }

        socket.onmessage = (evt) => {
            console.log(evt.data);


        }

        socket.onerror = () => {
            console.log("err");

        }
    }, [])

    // musics = await ApiService.getMusics(guild_id).then((res) => res.data).catch(() => undefined);
    // channels = await ApiService.getChannels(guild_id, "voice").then((res) => res.data).catch(() => undefined);

    return (
        <>
            <DashboardSidebar channels={channels} />
            <div className="flex flex-col gap-2 w-full max-h-[calc(100vh-16px)] mr-2 mt-2 overflow-auto">
                <JukeboxFeaturePage musics={musics} />
            </div>
        </>
    );
}
