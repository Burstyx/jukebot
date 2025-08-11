import fastify from "fastify";
import cors from "@fastify/cors"
import formBody from "@fastify/formbody"
import websocket from "@fastify/websocket"
import { FRONTEND_URL, PORT } from "@/config/constants";
import wsRoutes from "@/routes/ws.routes";
import { Jukebot } from "@/bot/jukebot";
import guildsRoutes from "@/routes/guilds.routes";
import libraryRoutes from "@/routes/library.routes";

const app = fastify({
    logger: true
});

const jukebot = new Jukebot()
app.decorate("jukebot", jukebot)

app.register(cors, {
    origin: [FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "OPTIONS", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-File-Name"],
    credentials: true,
    maxAge: 86400
})
app.register(formBody)
app.register(websocket)

app.addContentTypeParser(/^audio\/.*/, { parseAs: "buffer", bodyLimit: 200 * 1024 * 1024 }, (req, body, done) => {
    done(null, body);
});

app.register(guildsRoutes, { prefix: "api/v1/guilds" })
app.register(libraryRoutes, { prefix: "api/v1/library" })
app.register(wsRoutes, { prefix: "api/v1/ws" });

app.listen({ port: Number.parseInt(PORT) });