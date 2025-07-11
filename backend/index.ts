import fastify from "fastify";
import cors from "@fastify/cors"
import formBody from "@fastify/formbody"
import websocket from "@fastify/websocket"
import jukebot from "@/bot/jukebot";
import musicRouter from "@/routes/jukebox.routes"
// import channelsRouter from "@/routes/channels.routes"
import { DISCORD_TOKEN, FRONTEND_URL, PORT } from "@/config/constants";
import wsRoutes from "@/websocket/ws.routes";

jukebot.client.login(DISCORD_TOKEN);

const app = fastify({
    logger: true
});

app.register(cors, { origin: [FRONTEND_URL] })
app.register(formBody)
app.register(websocket)

app.addContentTypeParser(/^audio\/.*/, { parseAs: "buffer", bodyLimit: 200 * 1024 * 1024 }, (req, body, done) => {
    done(null, body);
});

app.register(wsRoutes);
app.register(musicRouter, { prefix: "/api/discord/musics" })
// app.register(channelsRouter, { prefix: "/api/discord/channels" })

app.listen({ port: Number.parseInt(PORT) });