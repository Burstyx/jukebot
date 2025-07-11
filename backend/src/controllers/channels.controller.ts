import jukebot from "@/bot/jukebot";
import ChannelsService from "@/services/channels.service";
import Errors from "@/utils/errors";
import Logger from "@/utils/logger";

export const getChannels = async (req: any, res: any) => {
    const { guild_id } = req.params;
    const { channel_type } = req.query

    Logger.info(`Get channels of type ${channel_type} called by ${guild_id}`)

    if (!guild_id || !channel_type)
        return res.status(400).json(Errors.createError("Certaines informations sont manquantes.", { guild_id, channel_type }))

    try {
        const channels = await ChannelsService.getChannels(jukebot.client, guild_id, channel_type)
        return res.status(200).json(channels);
    } catch (err) {
        return res.status(500).json(Errors.createError("Impossible de récupérer la liste des salons.", err))
    }
}