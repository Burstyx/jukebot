"use client";

import { ChevronRight, MusicIcon, PauseIcon, PlayIcon, SkipForward, StopCircleIcon } from "lucide-react";
import ChannelSelector from "./channel-selector";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ClearQueueWSMessage, Music, NextAudioWSMessage, PauseStateUpdatedWSMessage } from "@jukebot/types";
import ApiService from "@/services/api.service";
import WSService from "@/services/ws.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    guildId: string,
    socket: WebSocket
}

export default function DashboardSidebar(props: Props) {
    const [queue, setQueue] = useState<Music[]>([])
    const [currentMusic, setCurrentMusic] = useState<Music | undefined>(undefined)
    const [pauseState, setPauseState] = useState<boolean>(true)

    useEffect(() => {
        ApiService.getQueue(props.guildId).then((res) => {
            setQueue(res.data.queue)
            setCurrentMusic(res.data.current_music)
        })
        ApiService.getPauseState(props.guildId).then((res) => setPauseState(res.data))

        WSService.wsEvents.on("queue_updated", (curMusic, curQueue) => {
            setQueue(curQueue)
            setCurrentMusic(curMusic)
        })
        WSService.wsEvents.on("pause_state_updated", (pause) => setPauseState(pause))
    }, [])

    function updatePauseState() {
        const data: PauseStateUpdatedWSMessage = {
            type: "pause_state_updated",
            payload: {
                pause: !pauseState
            }
        }

        props.socket.send(JSON.stringify(data))
    }

    function nextAudio() {
        toast.message("Musique passé")
        const data: NextAudioWSMessage = {
            type: "next_audio",
        }

        props.socket.send(JSON.stringify(data))
    }

    function clearQueue() {
        toast.message("Queue supprimé")
        const data: ClearQueueWSMessage = {
            type: "clear_queue",
        }

        props.socket.send(JSON.stringify(data))
    }

    return (
        <Card className="flex flex-col w-100 h-full p-2">
            <CardContent className="flex flex-col flex-1 gap-4 p-2 overflow-auto">
                <div className="flex flex-col gap-2 items-center">
                    <ChannelSelector guildId={props.guildId} socket={props.socket} />
                    <div className="flex gap-2 w-full">
                        <Button className="flex-1" onClick={updatePauseState}>{pauseState ? <PlayIcon /> : <PauseIcon />}</Button>
                        <Button variant={"destructive"} onClick={clearQueue}><StopCircleIcon /></Button>
                        <Button variant="outline" disabled={queue.length === 0} onClick={nextAudio}><SkipForward /></Button>
                    </div>
                </div>
                <div className="flex flex-col gap-2 overflow-auto text-gray-500">
                    {currentMusic ? <div className="flex gap-2 border-1 rounded-sm p-2 hover:bg-accent transition-colors text-foreground">
                        <ChevronRight width={18} />
                        <MusicIcon width={18} />
                        <span className="truncate max-w-[300px]">{decodeURI(currentMusic.name)}</span>                    </div> : undefined}
                    {queue.map((music, index) =>
                        <div key={index} className="flex gap-2 border-1 rounded-sm p-2 hover:bg-accent transition-colors">
                            <MusicIcon width={18} />
                            <span className="truncate max-w-[300px]">{decodeURI(music.name)}</span>                        </div>
                    )}
                </div>
            </CardContent>
        </Card >
    )
}