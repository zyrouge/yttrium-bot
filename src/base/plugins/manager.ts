import { App } from "@/base/app";
import { CommandManager } from "@/base/plugins/commands";
import { AnimeDatabase } from "@/base/plugins/animedb/AnimeDatabase";
import { AnimeTopList } from "@/base/plugins/animelist/Top";
import { AnimeGirlsHoldingProgrammingBooks } from "@/base/plugins/animegirlbooks/AnimeGirlsHoldingProgrammingBooks";
import { CronRunner } from "@/base/plugins/cron/Runner";
import { Cron } from "@/utils/cron";
import { PromiseUtils } from "@/utils/promise";

export interface PluginsManagerOptions {}

export class PluginsManager {
    app: App;

    commands: CommandManager;
    animedb: AnimeDatabase;
    animelist: AnimeTopList;
    animegirlsbooks: AnimeGirlsHoldingProgrammingBooks;
    cron: CronRunner;

    constructor(app: App, options: PluginsManagerOptions) {
        this.app = app;

        this.commands = new CommandManager();
        this.animedb = new AnimeDatabase();
        this.animelist = new AnimeTopList();
        this.animegirlsbooks = new AnimeGirlsHoldingProgrammingBooks();
        this.cron = new CronRunner(this.app);
    }

    async ready() {
        await this.animedb.prepare();
        const animedb = this.animedb.fetchAndUpdateDatabase.bind(this.animedb);

        await this.animelist.prepare();
        const animelist = this.animelist.fetchAndUpdateDatabase.bind(
            this.animelist
        );

        await this.animegirlsbooks.prepare();
        const animegirlsbooks =
            this.animegirlsbooks.fetchAndUpdateDatabase.bind(
                this.animegirlsbooks
            );

        this.cron.addJob("ANIME_DATABASE_UPDATE", Cron.every6hours, animedb);

        this.cron.addJob("ANIME_LIST_UPDATE", Cron.every6hours, animelist);

        this.cron.addJob(
            "ANIME_GIRL_HOLDING_BOOKS_UPDATE",
            Cron.every12hours,
            animegirlsbooks
        );

        [animedb, animelist, animegirlsbooks].forEach((x) => {
            PromiseUtils.awaitFn(x);
        });
    }
}
