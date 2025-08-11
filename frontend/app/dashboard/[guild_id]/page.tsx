"use client"

import DashboardSidebar from "@/components/dashboard-sidebar";
import JukeboxFeaturePage from "@/components/jukebox-feature-page";
import ApiService from "@/services/api.service";
import WSService from "@/services/ws.service";
import { Channel, Music, UpdateVCWSMessage } from "@jukebot/types"
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
    const { guild_id } = useParams()
    const retryDelayMs = 10000

    const reconnectTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const [ws, setWs] = useState<WebSocket | undefined>(undefined);
    const [wsError, setWsError] = useState<boolean>(false)

    useEffect(() => {
        async function initWS() {
            function tryReconnecting() {
                setWsError(true)
                if (!reconnectTimerRef.current) {
                    reconnectTimerRef.current = setTimeout(() => {
                        console.log("attempting reconnection...");
                        reconnectTimerRef.current = undefined
                        initWS()
                    }, retryDelayMs);
                }
            }

            const ws = new WebSocket(`ws://127.0.0.1:5000/api/v1/ws/${guild_id}`)
            setWs(ws)

            ws.onopen = () => { setWsError(false) }
            ws.onmessage = (evt) => WSService.handle(evt.data)

            ws.onclose = tryReconnecting
            ws.onerror = tryReconnecting
        }
        initWS()
    }, [])

    if (wsError) {
        return (
            <div className="p-6 text-center">
                <p className="mb-2 font-semibold">Erreur de connexion au serveur.</p>
                <p>Nouvelle tentative dans {retryDelayMs / 1000} secondes…</p>
            </div>
        )
    } else if (!ws) {
        return (
            <p>Loading......</p>
        );
    } else {
        return (
            <>
                <DashboardSidebar guildId={guild_id as string} socket={ws} />
                <JukeboxFeaturePage guildId={guild_id as string} />
            </>
        )
    }
}
