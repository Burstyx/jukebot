import {
  createAudioPlayer,
  VoiceConnection,
  AudioPlayerStatus,
  joinVoiceChannel,
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { Guild } from "discord.js";
import { DATA_PATH } from "@/config/constants";
import path from "path";
import fs from "fs";
import { Music } from "@jukebot/types";
import WS from "@/utils/ws";

export default class Jukebox {
  private static readonly voiceReadyTimeoutMs = 30_000;

  public pauseState: boolean = true;
  public guild: Guild;
  public currentMusic?: Music;
  public queue: Music[] = [];
  public voiceChannelId: string | undefined;

  private voiceConnection: VoiceConnection | undefined;
  private voiceConnectionPromise: Promise<VoiceConnection> | undefined;
  private pendingVoiceChannelId: string | undefined;
  private connectedVoiceChannelId: string | undefined;
  private observedVoiceConnection: VoiceConnection | undefined;
  private audioPlayer = createAudioPlayer();

  /**
   * Initialize playlist handler
   * @param guild Associated guild of the jukebox
   */
  constructor(guild: Guild) {
    this.guild = guild;

    this.audioPlayer.on("stateChange", (_, newState) => {
      if (!this.voiceConnection) return;

      if (newState.status === AudioPlayerStatus.Idle) {
        this.pauseState = true;
        WS.updatePauseState(this.guild.id, this.pauseState);
        if (this.currentMusic) void this.playNextAudio();
      } else if (newState.status === AudioPlayerStatus.Paused) {
        this.pauseState = true;
        WS.updatePauseState(this.guild.id, this.pauseState);
      } else if (newState.status === AudioPlayerStatus.Playing) {
        this.pauseState = false;
        WS.updatePauseState(this.guild.id, this.pauseState);
      }
    });

    this.audioPlayer.on("error", (err) => {
      console.error(`audioPlayer: Playback failed for guild ${this.guild.id}:`, err);
      WS.error(
        this.guild.id,
        "INTERNAL",
        "Audio playback failed. Check the backend logs for details.",
        err,
      );
      void this.playNextAudio();
    });
  }

  /**
   * Play a music to the current voice connection
   * @param music Music to play
   * @returns True if it worked, false otherwise
   */
  public async play(music: Music): Promise<boolean> {
    if (!this.voiceChannelId) {
      throw new Error("No voice channel selected.");
    }

    const audioPath = path.join(DATA_PATH, `${music.hash}.opus`);
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    await this.ensureVoiceConnectionReady();
    const audioResource = createAudioResource(audioPath);

    this.audioPlayer.play(audioResource);

    this.pauseState = false;

    return true;
  }

  /**
   * Play next audio from the queue
   */
  public async playNextAudio(): Promise<void> {
    const nextAudio = this.queue.shift();

    if (!nextAudio) {
      this.resetQueue();
    } else {
      this.currentMusic = nextAudio;
      this.pauseState = false;
      WS.updateQueue(this.guild.id, this.currentMusic, this.queue);

      try {
        await this.play(nextAudio);
        WS.updateQueue(this.guild.id, this.currentMusic, this.queue);
      } catch (err) {
        this.queue.unshift(nextAudio);
        this.currentMusic = undefined;
        console.error(`playNextAudio: Failed for guild ${this.guild.id}:`, err);
        WS.error(
          this.guild.id,
          "INTERNAL",
          "Could not play the selected audio.",
          err,
        );
        this.pauseState = true;
        WS.updateQueue(this.guild.id, this.currentMusic, this.queue);
        WS.updatePauseState(this.guild.id, this.pauseState);
      }
    }
  }

  /**
   * Remove all musics from the queue
   */
  public resetQueue(): void {
    this.queue = [];
    this.currentMusic = undefined;
    this.pauseState = true;
    if (this.audioPlayer.state.status !== AudioPlayerStatus.Idle) {
      this.audioPlayer.stop(true);
    }

    WS.updateQueue(this.guild.id, this.currentMusic, this.queue);
  }

  /**
   * Pause music
   */
  private pause(): void {
    this.pauseState = true;
    this.audioPlayer.pause();
  }

  /**
   * Unpause music
   */
  private async unpause(): Promise<void> {
    this.pauseState = false;
    if (!this.currentMusic) await this.playNextAudio();
    else this.audioPlayer.unpause();
  }

  /**
   * Set pause state
   * @param pauseState Pause state
   */
  public async updatePauseState(pauseState: boolean): Promise<void> {
    if (pauseState) this.pause();
    else await this.unpause();
  }

  /**
   * Init voice connection to join voice channel
   * @returns True if is worked, false otherwise
   */
  public async joinVoiceChannel(): Promise<boolean> {
    const connection = await this.createVoiceConnection();
    this.attachAudioPlayer(connection);
    return this.connectedVoiceChannelId === this.voiceChannelId;
  }

  public async moveVoiceConnection(channelId: string): Promise<void> {
    this.voiceChannelId = channelId;
    this.connectedVoiceChannelId = channelId;

    if (
      this.voiceConnection &&
      this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed
    ) {
      const moved = this.voiceConnection.rejoin({
        channelId,
        selfDeaf: false,
        selfMute: false,
      });
      if (!moved) throw new Error("Could not update Discord voice channel.");

      this.attachAudioPlayer(await this.ensureVoiceConnectionReady());
    }
  }

  public disconnectVoiceConnection(): void {
    this.voiceChannelId = undefined;
    this.destroyVoiceConnection();
  }

  private async createVoiceConnection(): Promise<VoiceConnection> {
    const targetChannelId = this.voiceChannelId;
    if (!targetChannelId) {
      throw new Error("No voice channel selected.");
    }

    if (this.voiceConnectionPromise) {
      if (this.pendingVoiceChannelId === targetChannelId) {
        return await this.voiceConnectionPromise;
      }

      await this.voiceConnectionPromise.catch(() => undefined);
      if (this.voiceChannelId !== targetChannelId) {
        return await this.createVoiceConnection();
      }
    }

    if (
      this.voiceConnection &&
      this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed &&
      this.connectedVoiceChannelId === targetChannelId
    ) {
      return await this.ensureVoiceConnectionReady();
    }

    let connection = this.voiceConnection;
    if (
      connection &&
      connection.state.status !== VoiceConnectionStatus.Destroyed
    ) {
      const moved = connection.rejoin({
        channelId: targetChannelId,
        selfDeaf: false,
        selfMute: false,
      });
      if (!moved) throw new Error("Could not update Discord voice channel.");
    } else {
      connection = joinVoiceChannel({
        adapterCreator: this.guild.voiceAdapterCreator,
        channelId: targetChannelId,
        guildId: this.guild.id,
        selfDeaf: false,
      });
    }

    this.voiceConnection = connection;
    this.connectedVoiceChannelId = targetChannelId;

    this.observeVoiceConnection(connection);

    this.pendingVoiceChannelId = targetChannelId;
    this.voiceConnectionPromise = this.ensureVoiceConnectionReady().finally(
      () => {
        this.voiceConnectionPromise = undefined;
        this.pendingVoiceChannelId = undefined;
      },
    );

    return await this.voiceConnectionPromise;
  }

  private async ensureVoiceConnectionReady(): Promise<VoiceConnection> {
    if (!this.voiceConnection) {
      return await this.createVoiceConnection();
    }

    const connection = this.voiceConnection;

    if (connection.state.status === VoiceConnectionStatus.Ready) {
      this.attachAudioPlayer(connection);
      return connection;
    }

    try {
      await entersState(
        connection,
        VoiceConnectionStatus.Ready,
        Jukebox.voiceReadyTimeoutMs,
      );
      this.attachAudioPlayer(connection);
      return connection;
    } catch {
      if (this.voiceConnection === connection) {
        this.destroyVoiceConnection();
      } else {
        this.destroyConnection(connection);
      }

      throw new Error("Discord voice connection is not ready.");
    }
  }

  private attachAudioPlayer(connection: VoiceConnection): void {
    const subscription = connection.subscribe(this.audioPlayer);
    if (!subscription) {
      throw new Error("Could not subscribe the audio player to the voice connection.");
    }
  }

  private observeVoiceConnection(connection: VoiceConnection): void {
    if (this.observedVoiceConnection === connection) return;

    this.observedVoiceConnection = connection;
    connection.on("error", (err) => {
      console.error(`voiceConnection: Error for guild ${this.guild.id}:`, err);
      WS.error(
        this.guild.id,
        "INTERNAL",
        "Discord voice connection failed.",
        err,
      );
    });
  }

  private destroyVoiceConnection(): void {
    const connection = this.voiceConnection;
    this.voiceConnectionPromise = undefined;
    this.pendingVoiceChannelId = undefined;
    if (!connection) return;

    this.destroyConnection(connection);
    this.voiceConnection = undefined;
    this.connectedVoiceChannelId = undefined;
    this.observedVoiceConnection = undefined;
  }

  private destroyConnection(connection: VoiceConnection): void {
    connection.removeAllListeners();
    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
      try {
        connection.destroy();
      } catch (err) {
        console.warn(
          `voiceConnection: ${this.guild.id} destroy ignored:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  /**
   * Destroy jukebox audio components
   */
  public destroy(): void {
    try {
      this.queue = [];
      this.currentMusic = undefined;
      this.pauseState = true;
      WS.updateQueue(this.guild.id, this.currentMusic, this.queue);
      WS.updatePauseState(this.guild.id, this.pauseState);

      this.audioPlayer.stop();
      this.destroyVoiceConnection();
    } catch {
      console.error(`destroy: Destroy jukebox audio components failed: ${this.guild.id}`)
    }
  }
}
