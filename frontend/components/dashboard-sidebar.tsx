"use client";

import { Music, Pause, Play, UserCircle } from "lucide-react";
import ChannelSelector from "./channel-selector";
import { useSelectedChannelId } from "@/hooks/use-selected-channel-id"
import { Channel } from "@/types/channel";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

type Props = {
    channels: Channel[] | undefined,
}

export default function DashboardSidebar(props: Props) {
    const { setSelectedChannelId } = useSelectedChannelId();

    return (
        <Card className="flex flex-col w-100 h-[calc(100vh-16px)] m-2 p-2 overflow-auto">
            <CardContent className="flex flex-col flex-1 gap-4 p-2 overflow-auto">
                <div className="flex gap-2">
                    <ChannelSelector channels={props.channels ?? []} onValueChange={(channelId) => setSelectedChannelId(channelId)} />
                    <Button><Play /></Button>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-bold">En cours de lecture</p>
                    <div className="flex gap-2 border-1 rounded-sm p-2 hover:bg-accent transition-colors">
                        <Music width={18} />
                        Musique 1
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-bold">À suivre</p>
                    <div className="flex gap-2 border-1 rounded-sm p-2 hover:bg-accent transition-colors">
                        <Music width={18} />
                        Musique 2
                    </div>
                    <div className="flex gap-2 border-1 rounded-sm p-2 hover:bg-accent transition-colors">
                        <Music width={18} />
                        Musique 3
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-2">
                <Button className="w-full justify-start" variant="ghost">
                    <UserCircle />
                    Burstyx
                </Button>
            </CardFooter>
        </Card >
    )
}