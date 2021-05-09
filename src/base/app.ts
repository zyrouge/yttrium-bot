import pino from "pino";
import path from "path";
import { promises as fs } from "fs";
import { Bot, BotOptions } from "@/base/bot";
import { CommandManager } from "@/base/plugins/commands";
import { GuildAudioManager } from "@/base/plugins/music/queue";
import { Functions } from "@/util";

export type AppFile = (app: App) => any;

export interface AppOptions {
    botOptions: BotOptions;
}

export class App {
    options: AppOptions;
    bot: Bot;
    logger = pino();
    commands = new CommandManager();
    music: Map<string, GuildAudioManager> = new Map();
    cacheData: Map<string, any> = new Map();

    constructor(options: AppOptions) {
        this.options = options;
        this.logger = pino();
        this.bot = new Bot(options.botOptions);
        this.commands = new CommandManager();
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
        if (!file?.default || !Functions.isFunction(file?.default))
            return this.logger.error(`Failed to handle ${dir}!`);

        await file.default(this);
        this.logger.info(`Loaded ${dir} successfully!`);
    }

    async ready() {
        await this.bot.connect();
    }
}
