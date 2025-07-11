import { getMusics, playMusic, uploadMusic, updateMusicState, addMusicToQueue, removeMusicFromQueue, getMusicsInQueue } from "@/controllers/music.controller";
import { removeMusic } from "@/controllers/music.controller";
import { FastifyInstance } from "fastify";

export default async function jukeboxRoutes(app: FastifyInstance) {
    app.get("/:guild_id", getMusics)
    app.post("/:guild_id", playMusic)

    app.post("/state/:guild_id", updateMusicState)

    app.get("/queue/:guild_id", getMusicsInQueue)
    app.post("/queue/:guild_id", addMusicToQueue)
    app.post("/queue/delete/:guild_id", removeMusicFromQueue)

    app.post("/upload/:guild_id", uploadMusic)

    app.post("/delete/:guild_id", removeMusic)
}

