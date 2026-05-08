"use client";

import { getEnvVar } from "@/config/constants";
import DashboardSidebar from "@/components/dashboard-sidebar";
import JukeboxFeaturePage from "@/components/jukebox-feature-page";
import WSService from "@/services/ws.service";
import type { WSErrorPayload } from "@jukebot/types";
import { RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  guildId: string;
};

export default function GuildDashboard({ guildId }: Props) {
  const retryDelayMs = 10000;
  const wsUrl = `${getEnvVar("NEXT_PUBLIC_WS_URL")}/${guildId}`;

  const reconnectTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [ws, setWs] = useState<WebSocket | undefined>(undefined);
  const [wsError, setWsError] = useState<boolean>(false);
  const [connectAttempt, setConnectAttempt] = useState(0);

  useEffect(() => {
    let activeSocket: WebSocket | undefined;
    let closedByComponent = false;

    async function initWS() {
      function tryReconnecting() {
        if (closedByComponent) return;
        setWsError(true);
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = undefined;
            initWS();
          }, retryDelayMs);
        }
      }

      activeSocket = new WebSocket(wsUrl);
      setWs(activeSocket);

      activeSocket.onopen = () => {
        setWsError(false);
      };
      activeSocket.onmessage = (evt) => WSService.handle(evt.data);

      activeSocket.onclose = tryReconnecting;
      activeSocket.onerror = tryReconnecting;
    }

    initWS();

    const onServerError = (payload: WSErrorPayload) => {
      toast.error(payload.message, {
        description:
          typeof payload.details === "string" ? payload.details : payload.code,
      });
    };
    WSService.wsEvents.on("ws_error", onServerError);

    return () => {
      closedByComponent = true;
      activeSocket?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      WSService.wsEvents.off("ws_error", onServerError);
    };
  }, [wsUrl, connectAttempt]);

  const reconnectNow = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = undefined;
    }
    setWs(undefined);
    setWsError(false);
    setConnectAttempt((attempt) => attempt + 1);
  };

  if (wsError) {
    return (
      <main className="flex min-h-[calc(100vh-1rem)] w-full items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
            <WifiOff className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">WebSocket connection lost</h1>
            <p className="text-muted-foreground">
              The dashboard cannot reach the backend right now. It will retry in{" "}
              {retryDelayMs / 1000} seconds.
            </p>
          </div>
          <code className="block rounded-md border bg-muted p-3 text-sm">
            {wsUrl}
          </code>
          <Button type="button" onClick={reconnectNow} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reconnect now
          </Button>
        </div>
      </main>
    );
  } else if (!ws) {
    return (
      <main className="flex min-h-[calc(100vh-1rem)] w-full items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-4">
          <h1 className="text-2xl font-semibold">Connecting to Jukebot</h1>
          <p className="text-muted-foreground">
            Opening the live dashboard for Discord server {guildId}.
          </p>
        </div>
      </main>
    );
  } else {
    return (
      <>
        <DashboardSidebar guildId={guildId} socket={ws} />
        <JukeboxFeaturePage guildId={guildId} />
      </>
    );
  }
}
