require("module-alias/register");

import dotenv from "dotenv";
import path from "path";
import { Intents } from "discord.js";
import { App } from "@/base/app";
import { Logger } from "@/utils/logger";

const start = async () => {
    dotenv.config({
        path: path.join(__dirname, "..", ".env"),
    });

    if (!process.env.TOKEN) throw new Error("Missing 'process.env.TOKEN'");

    const app = new App({
        botOptions: {
            token: process.env.TOKEN,
            clientOptions: {
                intents: [
                    Intents.FLAGS.GUILDS,
                    Intents.FLAGS.GUILD_MESSAGES,
                    Intents.FLAGS.GUILD_MEMBERS,
                    Intents.FLAGS.GUILD_VOICE_STATES,
                ],
                allowedMentions: {
                    parse: ["roles", "users"],
                    repliedUser: false,
                },
            },
        },
        pluginOptions: {},
    });

    await app.dir(path.join(__dirname, "events"));
    await app.dir(path.join(__dirname, "commands"));

    await app.ready();
    Logger.info(`Application loaded successfully!`);
};

start();
