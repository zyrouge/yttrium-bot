import { Duration } from "@/utils/duration";
import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    entersState,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import { App } from "../../app";
import { Queue } from "./queue";

export class Player {
    #app: App;
    #readyLock = false;

    id: string;
    queue = new Queue();
    textChannel?: string;
    voiceChannel?: string;
    voiceConnection?: VoiceConnection;
    voicePlayer?: AudioPlayer;

    constructor(app: App, id: string) {
        this.#app = app;
        this.id = id;
    }

    async join(voiceChannel: string) {
        const channel = await this.#app.bot.channels.fetch(voiceChannel);
        if (channel?.isVoice() && channel.joinable) {
            this.voiceConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                selfDeaf: true,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            this.voiceConnection.on("stateChange", async (_, newState) => {
                if (newState.status === VoiceConnectionStatus.Disconnected) {
                    if (
                        newState.reason ===
                            VoiceConnectionDisconnectReason.WebSocketClose &&
                        newState.closeCode === 4014
                    ) {
                        try {
                            await entersState(
                                this.voiceConnection!,
                                VoiceConnectionStatus.Connecting,
                                5_000
                            );
                        } catch {
                            this.voiceConnection!.destroy();
                            delete this.voiceConnection;
                            delete this.voicePlayer;
                            delete this.voiceChannel;
                        }
                    } else if (this.voiceConnection!.rejoinAttempts < 5) {
                        await Duration.sleep(
                            (this.voiceConnection!.rejoinAttempts + 1) * 5_000
                        );
                        this.voiceConnection!.rejoin();
                    } else {
                        this.voiceConnection!.destroy();
                    }
                } else if (
                    newState.status === VoiceConnectionStatus.Destroyed
                ) {
                    this.stop();
                } else if (
                    !this.#readyLock &&
                    (newState.status === VoiceConnectionStatus.Connecting ||
                        newState.status === VoiceConnectionStatus.Signalling)
                ) {
                    this.#readyLock = true;
                    try {
                        await entersState(
                            this.voiceConnection!,
                            VoiceConnectionStatus.Ready,
                            20_000
                        );
                    } catch {
                        if (
                            this.voiceConnection!.state.status !==
                            VoiceConnectionStatus.Destroyed
                        )
                            this.voiceConnection!.destroy();
                    }

                    this.#readyLock = false;
                }
            });

            this.voicePlayer = createAudioPlayer();

            this.voicePlayer.on("stateChange", async (oldState, newState) => {
                if (
                    newState.status === AudioPlayerStatus.Idle &&
                    oldState.status !== AudioPlayerStatus.Idle
                ) {
                    // TODO: play next
                } else if (newState.status === AudioPlayerStatus.Playing) {
                    const channel = await this.#app.bot.channels.fetch(
                        this.textChannel!
                    );
                    const track = this.queue.current;
                    if (channel?.isText() && track) {
                        channel.send(`Started playing: **${track.title}**`);
                    }
                }
            });

            this.voiceConnection.subscribe(this.voicePlayer);

            this.voiceChannel = channel.id;
        }
    }

    stop() {
        this.voicePlayer?.stop(true);
        this.queue.empty();
    }
}
