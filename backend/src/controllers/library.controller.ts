import { Jukebot } from "@/bot/jukebot";
import LibraryService from "@/services/library.service";
import Errors from "@/utils/errors";
import Logger from "@/utils/logger";
import DataParser from "@/utils/parser";
import WS from "@/utils/ws";
import { MusicAddedWSMessage, WSServerMessage } from "@jukebot/types";
import { FastifyRequest, FastifyReply } from "fastify";

export const uploadFile = async (req: FastifyRequest<{ Params: { guild_id: string } }>, reply: FastifyReply, jukebot: Jukebot) => {
    const guildId = req.params.guild_id;
    const rawData = req.body
    const fileName = req.headers["x-file-name"] as string

    Logger.info(`Upload file called by ${guildId}`)

    if (!guildId || !rawData || !fileName)
        return reply.status(400).send(Errors.createError("Certaines informations sont manquantes.", { guildId, dataSpecified: rawData !== undefined, fileName: fileName }))

    if (!Buffer.isBuffer(rawData))
        return reply.status(400).send(Errors.createError("Les données reçu ne sont pas valides."))

    if (await LibraryService.exists(guildId, rawData, true))
        return reply.status(400).send(Errors.createError("Ce fichier audio existe déjà pour ce serveur."))


    try {
        const newMusic = await LibraryService.uploadFile(rawData, guildId, fileName, "Inconnu")

        const msg: WSServerMessage = {
            type: "music_added",
            payload: {
                music: newMusic
            }
        }
        WS.broadcast(guildId, msg)

        return { ok: true }
    } catch (err) {
        return reply.status(500).send(Errors.createError("Impossible de récupérer la liste des salons.", err))
    }
}

export const uploadFromUrl = async (req: FastifyRequest<{ Params: { guild_id: string } }>, reply: FastifyReply, jukebot: Jukebot) => {
    // const guildId = req.params.guild_id;
    // const rawData = req.body
    // const fileName = req.headers["x-file-name"] as string

    // Logger.info(`Upload file called by ${guildId}`)

    // if (!guildId || !rawData || !fileName)
    //     return reply.status(400).send(Errors.createError("Certaines informations sont manquantes.", { guildId, dataSpecified: rawData !== undefined, fileName: fileName }))

    // if (!Buffer.isBuffer(rawData))
    //     return reply.status(400).send(Errors.createError("Les données reçu ne sont pas valides."))

    // if (await UploadService.exists(guildId, rawData, true))
    //     return reply.status(400).send(Errors.createError("Ce fichier audio existe déjà pour ce serveur."))


    // try {
    //     const newMusic = await UploadService.uploadFile(rawData, guildId, fileName, "Inconnu")

    //     const msg: WSServerMessage = {
    //         type: "music_added",
    //         payload: {
    //             music: newMusic
    //         }
    //     }
    //     WS.broadcast(guildId, msg)

    //     return { ok: true }
    // } catch (err) {
    //     return reply.status(500).send(Errors.createError("Impossible de récupérer la liste des salons.", err))
    // }
}

export const deleteMusic = async (req: FastifyRequest<{ Params: { guild_id: string, music_hash: string } }>, reply: FastifyReply) => {
    const guildId = req.params.guild_id;
    const musicHash = req.params.music_hash

    Logger.info(`Delete music called by ${guildId}`)

    if (!guildId)
        return reply.status(400).send(Errors.createError("Certaines informations sont manquantes.", { guildId }))

    try {
        const music = await DataParser.getMusic(guildId, musicHash)
        await LibraryService.deleteMusic(guildId, music)

        const msg: WSServerMessage = {
            type: "music_removed",
            payload: {
                music: music
            }
        }
        WS.broadcast(guildId, msg)

        return { ok: true }
    } catch (err: any) {
        return reply.status(500).send(Errors.createError("Impossible de récupérer la liste des musiques.", err))
    }
}