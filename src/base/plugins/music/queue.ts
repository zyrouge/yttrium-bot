import {
    TextChannel,
    VoiceChannel,
    VoiceConnection,
    StreamDispatcher,
    MessageEmbed,
} from "discord.js";
import { Readable, Transform } from "stream";
import { Track } from "@/base/plugins/music/track";
import {
    createFFmpeg,
    encodeOpus,
    generateReadable,
    Streamer,
} from "@/base/plugins/music/stream";
import { AudioFilters } from "@/base/plugins/music/filters";
import { Colors, Emojis, Functions } from "@/util";

export type Loop = "queue" | "track" | "none";

export interface GuildAudioStreamExtended<
    Transcoder = Transform,
    Stream = Readable
> {
    transcoder: Transcoder;
    stream: Stream;
}

export interface GuildAudioStreams {
    song: Readable;
    ffmpeg?: GuildAudioStreamExtended<ReturnType<typeof createFFmpeg>>;
    opus?: GuildAudioStreamExtended<ReturnType<typeof encodeOpus>>;
}

export class GuildAudioManager {
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
    connection?: VoiceConnection;
    dispatcher?: StreamDispatcher;
    streamer?: Streamer;

    private _dontChangeIndex?: boolean;

    songs: Track[] = [];
    index: number | null = null;
    volume: number = 150;
    filters: Set<string> = new Set(["nightcore"]);
    loop: Loop = "none";

    constructor(textChannel: TextChannel, voiceChannel: VoiceChannel) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
    }

    get playing() {
        return this.index !== null;
    }

    get paused() {
        return !!(this.dispatcher && this.dispatcher.paused);
    }

    addTrack(track: Track) {
        const exist = this.songs.find((t) => t.url === track.url);
        if (exist) throw new Error("Already in queue");
        this.songs.push(track);
    }

    removeTrack(position: number) {
        if (!this.songs[position]) throw new Error("Invalid song index");
        const [removed] = this.songs.splice(position, 1);
        return removed;
    }

    clearQueue() {
        this.songs = [];
        this.index = null;
    }

    setLoop(state: Loop) {
        this.loop = state;
    }

    nowPlaying() {
        if (this.index === null) throw new Error("Nothing is being played");
        return this.songs[this.index];
    }

    streamTime() {
        if (!this.dispatcher) throw new Error("Nothing is being played");
        return this.dispatcher.streamTime;
    }

    pause() {
        if (!this.dispatcher) throw new Error("Nothing is being played");
        if (this.dispatcher.paused) throw new Error("Music is already paused");
        this.dispatcher.pause();
    }

    resume() {
        if (!this.dispatcher) throw new Error("Nothing is being played");
        if (!this.dispatcher.paused) throw new Error("Music is not paused");
        this.dispatcher.resume();
    }

    stop() {
        if (!this.connection || !this.dispatcher)
            throw new Error("Nothing is being played");
        this.cleanup();
        this.textChannel.send(`${Emojis.WAVE} | Music has been ended.`);
    }

    skip() {
        if (!this.dispatcher) throw new Error("Nothing is being played");
        this.incrementIndex(true);
        this._dontChangeIndex = true;
        this.dispatcher.end();
    }

    previous() {
        if (!this.dispatcher) throw new Error("Nothing is being played");
        this.decrementIndex(true);
        this._dontChangeIndex = true;
        this.dispatcher.end();
    }

    setVolume(volume: number) {
        if (!this.dispatcher) throw new Error("Nothing is being played");
        if (volume < 0 || volume > 200)
            throw new Error("Volume must be between 0-200");
        this.volume = volume;
        this.dispatcher.setVolumeLogarithmic(this.volume / 200);
    }

    shuffle() {
        const currentSongURL = this.nowPlaying();
        this.songs = Functions.shuffle(Functions.shuffle(this.songs));
        this.index = this.songs.findIndex((t) => t.url === currentSongURL.url);
    }

    jump(position: number) {
        if (!this.dispatcher) throw new Error("Nothing is being played");
        if (position < 0 || position > this.songs.length)
            throw new Error("Invalid song index");

        this.index = position;
        this._dontChangeIndex = true;
        this.dispatcher.end();
        return true;
    }

    setFilters(filters: string[]) {
        this.filters = new Set(filters);
        this.streamer?.modify(this.getFFmpegArgs());
    }

    formattedFilters() {
        const enabled = [...this.filters.values()].map((x) => x.toLowerCase());
        const all = Object.keys(AudioFilters);
        const filters: Record<string, boolean> = {};
        all.forEach((f) => {
            filters[f] = enabled.includes(f.toLowerCase());
        });
        return filters;
    }

    start(first: boolean = false) {
        if (this.index === null) this.index = first ? 0 : this.songs.length - 1;
        const song = this.songs[this.index];
        return song && this.play(song);
    }

    async getVoiceConnection() {
        if (!this.connection) {
            if (!this.voiceChannel.joinable)
                throw new Error("Voice channel is not joinable");
            this.connection = await this.voiceChannel.join();
            this.connection.on("disconnect", () => this.cleanup());
            this.connection.on("error", (err) =>
                this.textChannel.send(
                    `${Emojis.SAD} | Something went wrong! (${err})`
                )
            );
        }

        return this.connection;
    }

    async play(song: Track) {
        try {
            try {
                const track = await song.getStream();
                this.streamer = new Streamer(
                    track instanceof Readable
                        ? track
                        : await generateReadable(track.url, track.options),
                    this.getFFmpegArgs()
                );

                this.streamer.on("stream", async (stream) => {
                    console.log("new!");
                    setTimeout(async () => {
                        const connection = await this.getVoiceConnection();
                        this.dispatcher = connection.play(stream, {
                            bitrate: "auto",
                            volume: this.volume / 200,
                            type: "opus",
                        });
                    }, 1000);
                });

                // this.streamer.on("destroyed", () => {
                //     if (this.dispatcher && !this.dispatcher.destroyed)
                //         this.dispatcher.destroy();
                // });

                const desc = [
                    `**Title**: [${song.title}](${song.url})`,
                    `**Requested by**: <@${song.requester}>`,
                ];
                if (song.duration) desc.push(`**Duration:** ${song.duration}`);
                const embed = new MessageEmbed()
                    .setTitle(`${Emojis.DISC} | Now playing`)
                    .setDescription(desc.join("\n"))
                    .setColor(Colors.BLUE);
                if (song.thumbnail) embed.setThumbnail(song.thumbnail);
                const msg = await this.textChannel.send({ embed });

                this.streamer.on("end", async () => {
                    msg?.delete().catch(() => {});

                    this.incrementIndex();
                    await this.handleEnd();
                });

                this.streamer.on("error", console.error);

                this.streamer.generate();
            } catch (err) {
                const index = this.songs.findIndex((x) => x.url === song.url);
                if (Functions.isNumber(index)) this.removeTrack(index);
                console.error(err);

                this.textChannel.send(
                    `${Emojis.SAD} | Error while playing **${song.title}**, skipping to next.`
                );

                await this.handleEnd();
            }
        } catch (err) {
            this.cleanup();
            this.textChannel.send(
                `${Emojis.SAD} | Something went wrong! (${err})`
            );
        }
    }

    encodeStream(stream: Readable, reencode: boolean = false) {
        // if (!this.streams)
        //     throw new Error("Cannot encode stream when there is no stream");

        // if (reencode) {
        //     if (this.streams.opus) {
        //         this.streams.song.unpipe(this.streams.opus.transcoder);
        //         try {
        //             if (!this.streams.opus.transcoder.destroyed)
        //                 this.streams.opus.transcoder.destroy();
        //         } catch (err) {}
        //         delete this.streams.opus;
        //     }
        //     if (this.streams.ffmpeg) {
        //         this.streams.song.unpipe(this.streams.ffmpeg.transcoder);
        //         try {
        //             if (!this.streams.ffmpeg.transcoder.destroyed)
        //                 this.streams.ffmpeg.transcoder.destroy();
        //         } catch (err) {}
        //         delete this.streams.ffmpeg;
        //     }
        // }

        const args = this.getFFmpegArgs();
        const ffmpeger = createFFmpeg({ args });
        const opuser = encodeOpus();

        const ffmped = stream.pipe(ffmpeger);
        const opused = ffmped.pipe(opuser);

        return opused;
    }

    destoryStream() {
        // if (!this.streams) return;
        // try {
        //     if (this.streams.song && !this.streams.song.destroyed)
        //         this.streams.song.destroy();
        // } catch (err) {}
        // try {
        //     if (this.streams.opus && !this.streams.opus.transcoder.destroyed)
        //         this.streams.opus.transcoder.destroy();
        // } catch (err) {}
        // try {
        //     if (
        //         this.streams.ffmpeg &&
        //         !this.streams.ffmpeg.transcoder.destroyed
        //     )
        //         this.streams.ffmpeg.transcoder.destroy();
        // } catch (err) {}
    }

    getFFmpegArgs() {
        const args: string[] = [];

        const filters: string[] = [];
        const allFilters = Object.entries(AudioFilters);
        for (const name of this.filters.values()) {
            // @ts-ignore
            const filter = allFilters.find(
                ([key]) => key.toLowerCase() === name.toLowerCase()
            )?.[1];
            if (filter) filters.push(filter);
        }

        if (filters.length) args.push("-af", ...filters);

        return args;
    }

    async handleEnd() {
        this.destoryStream();
        if (this.index === null) throw new Error("Nothing is being played");
        const song = this.songs[this.index];
        if (song) return this.play(this.songs[this.index]);
        this.index = null;
    }

    incrementIndex(force: boolean = false) {
        if (this.index === null) throw new Error("Nothing is being played");
        if (!force && this.loop === "track") return;
        this.index = this.index + 1;
        if (this.loop === "queue" && !this.songs[this.index]) this.index = 0;
    }

    decrementIndex(force: boolean = false) {
        if (this.index === null) throw new Error("Nothing is being played");
        if (!force && this.loop === "track") return;
        this.index = this.index - 1;
        if (this.loop === "queue" && !this.songs[this.index])
            this.index = this.songs.length - 1;
    }

    cleanup() {
        try {
            this.dispatcher?.destroy();
        } catch (e) {}
        delete this.connection;
        delete this.dispatcher;
        this.clearQueue();
    }
}
