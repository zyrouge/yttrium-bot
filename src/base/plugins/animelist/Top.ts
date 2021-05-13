import path from "path";
import fs from "fs-extra";
import axios from "axios";
import cheerio from "cheerio";
import { getCacheInfo, updateCacheInfo } from "@/base/database/CacheInfoFile";
import { Constants, Functions, Logger } from "@/util";

export interface TopAnimesOptions {
    type?: TopAnimeTypesType;
}

export interface TopAnimeEntity {
    rank: string;
    title: string;
    url: string;
    score: string;
    series: string;
    run: string;
}

export let TopAnimeCache:
    | Record<TopAnimeTypesType | "all", TopAnimeEntity[]>
    | undefined = undefined;

export const TopAnimeTypes = [
    "airing",
    "upcoming",
    "tv",
    "movie",
    "ova",
    "ona",
    "special",
    "bypopularity",
    "favorite",
] as const;
export type TopAnimeTypesType = typeof TopAnimeTypes[number];

export class AnimeTopList {
    dataDir = path.join(Constants.paths.data, "animelist", "top");
    dbPath = path.join(this.dataDir, "top.json");
    cacheInfoPath = path.join(this.dataDir, "cacheInfo.json");
    maxAliveTime = 21600000;

    types = TopAnimeTypes;
    ready = false;
    isBeingUpdated = false;

    constructor() {}

    async prepare() {
        await fs.ensureDir(this.dataDir);

        this.ready = true;
    }

    async fetchAndUpdateDatabase() {
        if (!this.ready) throw new Error("Anime list is not ready yet");

        try {
            const cacheInfo = await getCacheInfo(this.cacheInfoPath);
            if (cacheInfo) {
                const expires = cacheInfo.lastUpdated + this.maxAliveTime;
                if (expires > Date.now()) {
                    const data = await fs.readFile(this.dbPath);
                    TopAnimeCache = JSON.parse(data.toString());
                    return Logger.info(
                        `Skipping Anime list update as it up-to-date! Remaining time: ${Functions.humanizeDuration(
                            Functions.parseMs(expires - Date.now())
                        )}`
                    );
                }
            }
        } catch (err) {}

        try {
            this.isBeingUpdated = true;
            Logger.info("Updating Anime list...");
            // @ts-ignore
            TopAnimeCache = {};

            for (const type of [undefined, ...TopAnimeTypes]) {
                const animes = await this.TopAnimesFetcher({
                    type,
                });

                // @ts-ignore
                TopAnimeCache[type || "all"] = animes;
                await Functions.sleep(5000);
            }

            await fs.writeFile(
                this.dbPath,
                JSON.stringify(TopAnimeCache, null, 4)
            );
            Logger.info("Updated Anime list!");
            await updateCacheInfo(this.cacheInfoPath, {
                lastUpdated: Date.now(),
            });
            this.isBeingUpdated = false;
        } catch (err) {
            this.isBeingUpdated = false;
            Logger.error(`Failed to update Anime list! - ${err}`);
        }
    }

    async TopAnimesFetcher(options: TopAnimesOptions) {
        const { data } = await axios.get<string>(
            Constants.urls.animeList.top(options.type),
            {
                responseType: "text",
            }
        );

        const animes: TopAnimeEntity[] = [];
        const $ = cheerio.load(data);
        $(".ranking-list").each(function () {
            const ele = $(this);

            const rank = ele.find(".rank").text().trim();
            const titleEle = ele.find(".title h3 a");

            const title = titleEle.text().trim();
            const url = titleEle.attr("href");
            if (!url) return;

            const score = ele.find(".score").text().trim();
            const [series, run] = ele
                .find(".information")
                .text()
                .trim()
                .split("\n")
                .map((x) => x.trim());

            animes.push({
                rank,
                title,
                url,
                score,
                series,
                run,
            });
        });

        return animes;
    }

    getAnimes(options: TopAnimesOptions) {
        if (!TopAnimeCache || !this.ready || this.isBeingUpdated)
            throw new Error("Anime list is not ready yet");

        return TopAnimeCache[options.type || "all"];
    }
}
