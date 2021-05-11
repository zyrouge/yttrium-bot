import path from "path";
import fs from "fs-extra";
import { Player, PlayerOptions } from "discord-player";
import { Bot, BotOptions } from "@/base/bot";
import { CommandManager } from "@/base/plugins/commands";
import { FetchAndUpdateDatabase as AnimeDB } from "@/base/plugins/animedb/AnimeDatabase";
import { StartPreScheduledJobs } from "./plugins/cron/Runner";
import { Logger } from "@/util";

export type AppFile = (app: App) => any;

export interface AppOptions {
    botOptions: BotOptions;
    musicOptions: PlayerOptions;
}

export class App {
    options: AppOptions;
    bot: Bot;
    commands: CommandManager;
    music: Player;
    cacheData: Map<string, any>;

    constructor(options: AppOptions) {
        this.options = options;
        this.bot = new Bot(options.botOptions);
        this.commands = new CommandManager();
        this.music = new Player(this.bot, options.musicOptions);
        this.cacheData = new Map();
    }

    async dir(dir: string) {
        const files = await fs.readdir(dir);
        for (const fn of files) {
            const ndir = path.join(dir, fn);
            const lstat = await fs.lstat(ndir);
            if (lstat.isDirectory()) await this.dir(ndir);
            else await this.file(ndir);
        }
    }

    async file(dir: string) {
        const file: { default: AppFile } | undefined = require(dir);
        if (typeof file?.default !== "function")
            return Logger.error(`Failed to handle ${dir}!`);
        await file.default(this);
        Logger.info(`Loaded ${dir} successfully!`);
    }

    async ready() {
        await this.bot.connect();
    }
}
