import ffmpeg from 'fluent-ffmpeg';
import { DATA_PATH } from "@/config/constants";
import path from 'path';
import fs from 'fs';
import Logger from './logger';

export default class AudioUtils {
    static async compressAndConvertToOpus(musicHash: string) {
        const audioPath = path.join(DATA_PATH, `${musicHash}.tmp`);
        const outputPath = path.join(DATA_PATH, `${musicHash}.opus`);

        return new Promise((resolve, reject) => {
            ffmpeg(audioPath)
                .audioCodec('libopus')
                .audioBitrate('64k')
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        }).finally(async () => {
            try {
                await fs.promises.rm(audioPath);
            } catch (err) {
                Logger.warn(`Can't delete ${audioPath}.`)
            }
        })
    }
}
