"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "./ui/select";
import { Volume2 } from "lucide-react";
import ApiService from "@/services/api.service";
import { Channel, UpdateVCClientMessage } from "@jukebot/types";
import WSService from "@/services/ws.service";

type Props = {
  guildId: string;
  socket: WebSocket;
};

export default function ChannelSelector(props: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    ApiService.getChannels(props.guildId).then((res) => setChannels(res.data));
    ApiService.getSelectedChannelId(props.guildId).then((res) =>
      setSelectedChannelId(res.data.channel_id),
    );

    const onUpdateVC = (channelId?: string | null) =>
      setSelectedChannelId(channelId ?? undefined);
    WSService.wsEvents.on("update_vc", onUpdateVC);

    return () => {
      WSService.wsEvents.off("update_vc", onUpdateVC);
    };
  }, [props.guildId]);

  function updateSelectedChannel(channelId: string) {
    setSelectedChannelId(channelId);

    const data: UpdateVCClientMessage = {
      type: "update_vc",
      payload: {
        channelId: channelId,
      },
    };

    props.socket.send(JSON.stringify(data));
  }

  return (
    <Select
      onValueChange={updateSelectedChannel}
      value={selectedChannelId}
      disabled={channels.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choisissez un salon" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {channels.map((channel, index) => (
            <SelectItem value={channel.id} key={index}>
              <Volume2 />
              {channel.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
