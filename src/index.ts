require("module-alias/register");

import dotenv from "dotenv";
import path from "path";
import { Intents } from "discord.js";
import { App } from "@/base/app";
import HttpStreams from "@/base/plugins/music/HttpStreams";

const start = async () => {
    dotenv.config();

    if (!process.env.TOKEN) throw new Error("Missing 'process.env.TOKEN'");

    const app = new App({
        botOptions: {
            token: process.env.TOKEN,
            clientOptions: {
                intents: [
                    Intents.FLAGS.GUILDS,
                    Intents.FLAGS.GUILD_MESSAGES,
                    Intents.FLAGS.GUILD_MEMBERS,
                ],
                allowedMentions: {
                    parse: ["roles", "users"],
                    repliedUser: false,
                },
            },
        },
        musicOptions: {
            ytdlDownloadOptions: {
                requestOptions: {
                    headers: {
                        cookie: process.env.YT_COOKIE,
                    },
                },
                quality: "highestaudio",
                filter: (format) => {
                    return format.hasAudio && !!format.audioBitrate;
                },
            },
        },
    });

    await app.dir(path.join(__dirname, "events"));
    await app.dir(path.join(__dirname, "commands"));
    app.music.use("URL_STREAM", HttpStreams);

    await app.ready();
    app.logger.info(`Application loaded successfully!`);
};

start();
