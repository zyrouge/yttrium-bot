import path from "path";
import fs from "fs-extra";
import axios from "axios";
import cheerio from "cheerio";
import { getCacheInfo, updateCacheInfo } from "@/base/database/CacheInfoFile";
import { Constants, Functions, Logger } from "@/util";

export const DataDir = path.join(Constants.paths.data, "animelist", "top");
export const DatabasePath = path.join(DataDir, "top.json");
export const CacheInfoPath = path.join(DataDir, "cacheInfo.json");
export const MaxAliveTime = 21600000;

fs.ensureDirSync(DataDir);

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

export let lastUpdated: number | undefined = undefined;
export let TopAnimeCache:
    | Record<TopAnimeTypesType | "all", TopAnimeEntity[]>
    | undefined = undefined;

export const getAnimes = async (options: TopAnimesOptions) => {
    if (!TopAnimeCache)
        throw new Error("Anime list is not ready yet");

    return TopAnimeCache[options.type || "all"];
};

export const TopAnimesFetcher = async (options: TopAnimesOptions) => {
    const { data } = await axios.get(
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
};

export const FetchAndUpdateDatabase = async () => {
    try {
        const cacheInfo = await getCacheInfo(CacheInfoPath);
        if (cacheInfo) {
            const expires = cacheInfo.lastUpdated + MaxAliveTime;
            if (expires > Date.now())
                return Logger.info(
                    `Skipping Anime list update as it up-to-date! Remaining time: ${Functions.humanizeDuration(
                        Functions.parseMs(expires - Date.now())
                    )}`
                );
        }
    } catch (err) {}

    try {
        Logger.info("Updating Anime list...");
        // @ts-ignore
        TopAnimeCache = {};

        for (const type of [undefined, ...TopAnimeTypes]) {
            const animes = await TopAnimesFetcher({
                type,
            });

            // @ts-ignore
            TopAnimeCache[type || "all"] = animes;
            await Functions.sleep(5000);
        }

        await fs.writeFile(
            DatabasePath,
            JSON.stringify(TopAnimeCache, null, 4)
        );
        Logger.info("Updated Anime list!");
        await updateCacheInfo(CacheInfoPath, {
            lastUpdated: Date.now(),
        });
    } catch (err) {
        Logger.error(`Failed to update Anime list! - ${err}`);
    }
};
