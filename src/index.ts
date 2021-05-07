require("module-alias/register");

import dotenv from "dotenv";
import path from "path";
import { App } from "@/base/app";

const start = async () => {
    dotenv.config();

    if (!process.env.TOKEN) throw new Error("Missing 'process.env.TOKEN'");

    const app = new App({
        botOptions: {
            token: process.env.TOKEN,
            clientOptions: {
                disableMentions: "everyone",
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
                filter: (format) =>
                    format.hasAudio &&
                    format.hasVideo &&
                    +format.contentLength > 0,
            },
        },
    });

    await app.dir(path.join(__dirname, "events"));
    await app.dir(path.join(__dirname, "commands"));

    await app.ready();
    app.logger.info(`Application loaded successfully!`);
};

start();
