import {
  addToQueue,
  getChannels,
  getMusics,
  getPauseState,
  getQueue,
  getSelectedChannel,
} from "@/controllers/guilds.controller";
import { FastifyInstance, FastifyRequest } from "fastify";

export default async function guildsRoutes(app: FastifyInstance) {
  app.get(
    "/get_channels/:guild_id",
    (req: FastifyRequest<{ Params: { guild_id: string } }>, reply) =>
      getChannels(req, reply, app.jukebot),
  );
  app.get(
    "/get_selected_channel/:guild_id",
    (req: FastifyRequest<{ Params: { guild_id: string } }>, reply) =>
      getSelectedChannel(req, reply, app.jukebot),
  );
  app.get(
    "/get_musics/:guild_id",
    (req: FastifyRequest<{ Params: { guild_id: string } }>, reply) =>
      getMusics(req, reply, app.jukebot),
  );
  app.put(
    "/add_to_queue/:guild_id/:music_hash",
    (
      req: FastifyRequest<{ Params: { guild_id: string; music_hash: string } }>,
      reply,
    ) => addToQueue(req, reply, app.jukebot),
  );
  app.get(
    "/get_queue/:guild_id",
    (req: FastifyRequest<{ Params: { guild_id: string } }>, reply) =>
      getQueue(req, reply, app.jukebot),
  );
  app.get(
    "/get_pause_state/:guild_id",
    (req: FastifyRequest<{ Params: { guild_id: string } }>, reply) =>
      getPauseState(req, reply, app.jukebot),
  );
}
