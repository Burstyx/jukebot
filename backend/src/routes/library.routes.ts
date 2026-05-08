import {
  deleteMusic,
  uploadFile,
  uploadFromUrl,
} from "@/controllers/library.controller";
import { FastifyInstance, FastifyRequest } from "fastify";

export default async function libraryRoutes(app: FastifyInstance) {
  app.post(
    "/file/:guild_id",
    (req: FastifyRequest<{ Params: { guild_id: string } }>, reply) =>
      uploadFile(req, reply, app.jukebot),
  );
  app.get(
    "/url/:guild_id",
    (req: FastifyRequest<{ Params: { guild_id: string } }>, reply) =>
      uploadFromUrl(req, reply, app.jukebot),
  );
  app.delete(
    "/delete_music/:guild_id/:music_hash",
    (
      req: FastifyRequest<{ Params: { guild_id: string; music_hash: string } }>,
      reply,
    ) => deleteMusic(req, reply),
  );
}
