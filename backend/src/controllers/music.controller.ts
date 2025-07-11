import jukebot from "@/bot/jukebot";
import JukebotAPI from "@/bot/lib/api";
import MusicService from "@/services/music.service";
import Errors from "@/utils/errors";
import Logger from "@/utils/logger";

export const getMusics = async (req: any, res: any) => {
    const { guild_id } = req.params;

    Logger.info(`Get music list called by ${guild_id}`)

    if (!guild_id)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id }))

    try {
        const data = await MusicService.getMusics(guild_id);
        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json(Errors.createError("Impossible de récupérer la liste des musiques.", err))
    }
}

export const playMusic = async (req: any, res: any) => {
    const { guild_id } = req.params;
    const { channel_id, music_hash } = req.body;

    Logger.info(`Play music ${music_hash} in ${channel_id} called by ${guild_id}`)

    if (!guild_id || !channel_id || !music_hash)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id, channel_id, music_hash }))

    try {
        await JukebotAPI.createSession(jukebot.client, guild_id, channel_id);
        await MusicService.playMusic(jukebot.client, guild_id, music_hash);
        return res.sendStatus(200);
    } catch (err: any) {
        return res.status(500).json(Errors.createError("Impossible de jouer la musique.", err))
    }
}

export const updateMusicState = async (req: any, res: any) => {
    const { guild_id } = req.params;
    const { pause } = req.body;

    Logger.info(`Updated pause state to ${pause} called by ${guild_id}`)

    if (!guild_id || pause === undefined)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id, pause }))

    try {
        await MusicService.updateMusicState(jukebot.client, guild_id, pause);
        return res.sendStatus(200);
    } catch (err: any) {
        return res.status(500).json(Errors.createError("Impossible de changer l'état de la musique.", err))
    }
}

export const getMusicsInQueue = async (req: any, res: any) => {
    const { guild_id } = req.params;

    Logger.info(`Get musics from queue called by ${guild_id}`)

    if (!guild_id)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id }))

    try {
        await MusicService.getMusicsFromQueue(jukebot.client, guild_id);
        return res.sendStatus(200);
    } catch (err: any) {
        return res.status(500).json(Errors.createError("Impossible de récuperer les musiques de la file.", err))
    }
}

export const addMusicToQueue = async (req: any, res: any) => {
    const { guild_id } = req.params;
    const { channel_id, music_hash } = req.body;

    Logger.info(`Added music ${music_hash} to queue in ${channel_id} called by ${guild_id}`)

    if (!guild_id || !channel_id || !music_hash)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id, channel_id, music_hash }))

    try {
        await MusicService.addMusicToQueue(jukebot.client, guild_id, music_hash);
        return res.sendStatus(200);
    } catch (err: any) {
        return res.status(500).json(Errors.createError("Impossible d'ajouter une musique dans la file.", err))
    }
}

export const removeMusicFromQueue = async (req: any, res: any) => {
    const { guild_id } = req.params;
    const { channel_id, index } = req.body;

    Logger.info(`Removed music at ${index} from queue in ${channel_id} called by ${guild_id}`)

    if (!guild_id || !channel_id || !index)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id, channel_id, index }))

    try {
        await MusicService.removeMusicFromQueue(jukebot.client, guild_id, index);
        return res.sendStatus(200);
    } catch (err: any) {
        return res.status(500).json(Errors.createError("Impossible de supprimer une musique de la file.", err))
    }
}

export const uploadMusic = async (req: any, res: any) => {
    const { guild_id } = req.params;
    const rawData = req.body
    const fileName = req.get("X-File-Name")

    Logger.info(`Upload music ${fileName} called by ${guild_id}`)

    if (!guild_id || !rawData || !fileName)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id, data_specified: rawData !== undefined, file_name: fileName }))

    if (!Buffer.isBuffer(rawData))
        return res.status(400).json(Errors.createError("Les données reçu ne sont pas valides."))

    if (await MusicService.exists(guild_id, rawData, true))
        return res.status(400).json(Errors.createError("Ce fichier audio existe déjà pour ce serveur."))

    try {
        const data = await MusicService.uploadMusic(rawData, guild_id, fileName)
        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json(Errors.createError("Impossible d'uploader la musique.", err))
    }
}

export const removeMusic = async (req: any, res: any) => {
    const { guild_id } = req.params;
    const { music_hash } = req.body;

    Logger.info(`Delete music ${music_hash} called by ${guild_id}`)

    if (!guild_id || !music_hash)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id, music_hash }))

    if (!await MusicService.exists(guild_id, music_hash, false))
        return res.status(400).json(Errors.createError("Cet audio n'existe pas."))

    try {
        const data = await MusicService.removeMusic(guild_id, music_hash);
        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json(Errors.createError("Impossible de supprimer la musique.", err))
    }
}