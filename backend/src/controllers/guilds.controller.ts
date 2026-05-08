import { Jukebot } from "@/bot/jukebot";
import GuildsService from "@/services/guilds.service";
import Errors from "@/utils/errors";
import Logger from "@/utils/logger";
import WS from "@/utils/ws";
import { WSServerMessage } from "@jukebot/types";
import { FastifyReply, FastifyRequest } from "fastify";

export const getChannels = async (
  req: FastifyRequest<{ Params: { guild_id: string } }>,
  reply: FastifyReply,
  jukebot: Jukebot,
) => {
  const guildId = req.params.guild_id;

  Logger.info(`Get voice channels called by ${guildId}`);

  if (!guildId)
    return reply
      .status(400)
      .send(
        Errors.createError("Certaines informations sont manquantes.", {
          guildId,
        }),
      );

  try {
    return await GuildsService.getChannels(jukebot, guildId);
  } catch (err) {
    return reply
      .status(500)
      .send(
        Errors.createError("Impossible de récupérer la liste des salons.", err),
      );
  }
};

export const getSelectedChannel = async (
  req: FastifyRequest<{ Params: { guild_id: string } }>,
  reply: FastifyReply,
  jukebot: Jukebot,
) => {
  const guildId = req.params.guild_id;

  Logger.info(`Get voice channels called by ${guildId}`);

  if (!guildId)
    return reply
      .status(400)
      .send(
        Errors.createError("Certaines informations sont manquantes.", {
          guildId,
        }),
      );

  try {
    const channelId = await GuildsService.getSelectedChannel(jukebot, guildId);

    return {
      ok: channelId !== undefined,
      channel_id: channelId,
    };
  } catch (err) {
    return reply
      .status(500)
      .send(
        Errors.createError("Impossible de récupérer la liste des salons.", err),
      );
  }
};

export const getMusics = async (
  req: FastifyRequest<{ Params: { guild_id: string } }>,
  reply: FastifyReply,
  jukebot: Jukebot,
) => {
  const guildId = req.params.guild_id;

  Logger.info(`Get music list called by ${guildId}`);

  if (!guildId)
    return reply
      .status(400)
      .send(
        Errors.createError("Certaines informations sont manquantes.", {
          guildId,
        }),
      );

  try {
    return await GuildsService.getMusics(jukebot, guildId);
  } catch (err: any) {
    return reply
      .status(500)
      .send(
        Errors.createError(
          "Impossible de récupérer la liste des musiques.",
          err,
        ),
      );
  }
};

export const addToQueue = async (
  req: FastifyRequest<{ Params: { guild_id: string; music_hash: string } }>,
  reply: FastifyReply,
  jukebot: Jukebot,
) => {
  const guildId = req.params.guild_id;
  const musicHash = req.params.music_hash;

  Logger.info(`Add to queue called by ${guildId}`);

  if (!guildId)
    return reply
      .status(400)
      .send(
        Errors.createError("Certaines informations sont manquantes.", {
          guildId,
          musicHash,
        }),
      );

  try {
    await GuildsService.addToQueue(jukebot, guildId, musicHash);

    const msg: WSServerMessage = {
      type: "queue_updated",
      payload: {
        current_music: await GuildsService.getCurrentMusic(jukebot, guildId),
        queue: await GuildsService.getQueue(jukebot, guildId),
      },
    };
    WS.broadcast(guildId, msg);

    return { ok: true };
  } catch (err: any) {
    return reply
      .status(500)
      .send(
        Errors.createError(
          "Impossible de récupérer la liste des musiques.",
          err,
        ),
      );
  }
};

export const getQueue = async (
  req: FastifyRequest<{ Params: { guild_id: string } }>,
  reply: FastifyReply,
  jukebot: Jukebot,
) => {
  const guildId = req.params.guild_id;

  Logger.info(`Get queue list called by ${guildId}`);

  if (!guildId)
    return reply
      .status(400)
      .send(
        Errors.createError("Certaines informations sont manquantes.", {
          guildId,
        }),
      );

  try {
    return {
      ok: true,
      current_music: await GuildsService.getCurrentMusic(jukebot, guildId),
      queue: await GuildsService.getQueue(jukebot, guildId),
    };
  } catch (err: any) {
    return reply
      .status(500)
      .send(
        Errors.createError(
          "Impossible de récupérer la liste des musiques.",
          err,
        ),
      );
  }
};

export const getPauseState = async (
  req: FastifyRequest<{ Params: { guild_id: string } }>,
  reply: FastifyReply,
  jukebot: Jukebot,
) => {
  const guildId = req.params.guild_id;

  Logger.info(`Get pause state called by ${guildId}`);

  if (!guildId)
    return reply
      .status(400)
      .send(
        Errors.createError("Certaines informations sont manquantes.", {
          guildId,
        }),
      );

  try {
    return await GuildsService.getPauseState(jukebot, guildId);
  } catch (err: any) {
    return reply
      .status(500)
      .send(
        Errors.createError(
          "Impossible de récupérer la liste des musiques.",
          err,
        ),
      );
  }
};
