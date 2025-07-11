"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "./ui/select";
import { Volume2 } from "lucide-react";

type Props = {
    channels: { name: string, id: string }[],
    onValueChange: (channelId: string) => void;
}

export default function ChannelSelector(props: Props) {
    return (
        <Select onValueChange={props.onValueChange} disabled={props.channels.length === 0}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisissez un salon" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {props.channels.map((channel, index) => (
                        <SelectItem value={channel.id} key={index}><Volume2 />{channel.name}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}