import axios, { AxiosRequestConfig } from "axios";
import { Readable, PassThrough } from "stream";
import { EventEmitter } from "events";
import { FFmpeg, opus } from "prism-media";
import { Constants, Functions } from "@/util";

export interface FFmpegOptions {
    args: string[];
}

export const createFFmpeg = (options: FFmpegOptions) => {
    options.args = [
        "-analyzeduration",
        "0",
        "-loglevel",
        "0",
        "-f",
        "s16le",
        "-ar",
        "48000",
        "-ac",
        "2",
        ...options.args,
    ];

    return new FFmpeg(options);
};

export const encodeOpus = () => {
    return new opus.Encoder({
        rate: 48000,
        channels: 2,
        frameSize: 960,
    });
};

export interface StreamOptions {
    ffmpeg: FFmpegOptions;
}

export const generateReadable = async (
    url: string,
    options: AxiosRequestConfig = {}
) => {
    options = Functions.mergeObj<AxiosRequestConfig>(
        {
            headers: {
                "User-Agent": Constants.http.UserAgent,
            },
        },
        options
    );

    const res = await axios.get<Readable>(
        url,
        Object.assign(options, {
            responseType: "stream",
        })
    );

    const contentType = Object.entries(res.headers).find(
        ([key]) => key.toLowerCase() === "content-type"
    )?.[1];

    if (!contentType) throw new Error("No `Content-Type` header was found!");
    if (!Functions.isString(contentType))
        throw new Error("No `Content-Type` header was found!");

    if (!Constants.regex.audioOrVideoContentType.test(contentType))
        throw new Error("URL must be a type of audio/video");

    return res.data;
};

export interface Streamer {
    on(event: "stream", listener: (stream: Readable) => any): this;
    on(event: "destroyed", listener: () => any): this;
    on(event: "end", listener: () => any): this;
    on(event: "error", listener: (err: Error) => any): this;
    on(event: string, listener: (...args: any[]) => any): this;
}

export class Streamer extends EventEmitter {
    main: Readable;
    stream: PassThrough;
    args: string[];

    ffmpeger?: ReturnType<typeof createFFmpeg>;
    opusser?: ReturnType<typeof encodeOpus>;

    clone?: PassThrough;
    ffmpeged?: Readable;
    opused?: Readable;

    constructor(stream: Readable, args: string[]) {
        super();

        this.main = stream;
        this.args = args;

        this.stream = new PassThrough();
        this.main.pipe(this.stream);

        this.stream.on("end", () => this.emit("end"));
        this.stream.on("error", (err) => this.emit("error", err));
        this.stream.on("close", () => console.log("closed"));
    }

    modify(args: string[]) {
        this.args = args;
        this.generate();
    }

    generate() {
        this.degenerate();

        this.clone = new PassThrough();

        this.ffmpeger = createFFmpeg({
            args: this.args,
        });
        this.ffmpeged = this.stream.pipe(this.ffmpeger);
        this.ffmpeged.on(
            "close",
            () =>
                this.ffmpeger &&
                !this.ffmpeger.destroyed &&
                this.ffmpeger.destroy()
        );

        this.opusser = encodeOpus();
        this.opused = this.ffmpeged.pipe(this.opusser);
        this.opused.on(
            "close",
            () =>
                this.opusser &&
                !this.opusser.destroyed &&
                this.opusser.destroy()
        );

        this.emit("stream", this.opused);
    }

    degenerate() {
        if (this.opusser) this.ffmpeged?.unpipe(this.opusser);
        if (this.ffmpeger) this.stream?.unpipe(this.ffmpeger);
        if (this.opused && !this.opused.destroyed) this.opused.destroy();
        if (this.ffmpeged && !this.ffmpeged.destroyed) this.ffmpeged.destroy();

        this.emit("destroyed");
    }
}
