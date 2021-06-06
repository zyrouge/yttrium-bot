import path from "path";
import fs from "fs-extra";
import { Bot, BotOptions } from "@/base/bot";
import { PluginsManager, PluginsManagerOptions } from "@/base/plugins/manager";
import { Database } from "@/base/database/Mongoose";
import { Logger } from "@/util";

export type AppFile = (app: App) => any;

export interface AppOptions {
    botOptions: BotOptions;
    pluginOptions: PluginsManagerOptions;
}

export class App {
    options: AppOptions;
    bot: Bot;
    plugins: PluginsManager;
    createdAt = Date.now();

    constructor(options: AppOptions) {
        this.options = options;
        this.bot = new Bot(options.botOptions);
        this.plugins = new PluginsManager(this, options.pluginOptions);
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
        await Database.connect();
        await this.plugins.ready();
    }
}
