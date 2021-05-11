import path from "path";
import axios from "axios";
import { Readable } from "stream";
import { parser as StreamParser } from "stream-json/Parser";
import { streamArray as StreamArray } from "stream-json/streamers/StreamArray";
import { pick as StreamPick } from "stream-json/filters/Pick";
import { BSQLDatabase } from "@/base/database/BSQLDatabase";
import { Constants, Functions, Logger } from "@/util";
import { getCacheInfo, updateCacheInfo } from "@/base/database/CacheInfoFile";

export const DataDir = path.join(Constants.paths.data, "animedb");
export const DatabasePath = path.join(DataDir, "data.db");
export const CacheInfoPath = path.join(DataDir, "cacheInfo.json");
export const MaxAliveTime = 21600000;

export const DataSplitter = "__,__";

export const Database = new BSQLDatabase({
    path: DatabasePath,
    name: "anime_db",
    schema: {
        id: {
            type: "integer",
            constraints: ["PRIMARY KEY", "NOT NULL"],
        },
        sources: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        title: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        type: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        episodes: {
            type: "integer",
            constraints: ["NOT NULL"],
        },
        status: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        season: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        year: {
            type: "integer",
            constraints: [],
        },
        picture: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        thumbnail: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        synonyms: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        relations: {
            type: "text",
            constraints: ["NOT NULL"],
        },
        tags: {
            type: "text",
            constraints: ["NOT NULL"],
        },
    },
});

export interface Anime {
    sources: string[];
    title: string;
    type: "TV" | "Movie" | "OVA" | "ONA" | "Special";
    episodes: number;
    status: "FINISHED" | "CURRENTLY" | "UPCOMING" | "UNKNOWN";
    animeSeason: {
        season: "SPRING" | "SUMMER" | "FALL" | "WINTER" | "UNDEFINED";
        year: number;
    };
    picture: string;
    thumbnail: string;
    synonyms: string[];
    relations: string[];
    tags: string[];
}

export const FetchAndUpdateDatabase = async () => {
    if (!Database.ready) Database.prepare();

    try {
        const cacheInfo = await getCacheInfo(CacheInfoPath);
        if (cacheInfo) {
            const expires = cacheInfo.lastUpdated + MaxAliveTime;
            if (expires > Date.now())
                return Logger.info(
                    `Skipping Anime Database update as it up-to-date! Remaining time: ${Functions.humanizeDuration(
                        Functions.parseMs(expires - Date.now())
                    )}`
                );
        }
    } catch (err) {}

    return new Promise<void>(async (resolve, reject) => {
        try {
            Logger.info("Updating Anime Database...");

            const res = await axios.get<Readable>(
                Constants.urls.animeOfflineDatabase.dataJson,
                {
                    responseType: "stream",
                    headers: {
                        "User-Agent": Constants.http.UserAgent,
                    },
                }
            );

            const collector = res.data
                .pipe(StreamParser())
                .pipe(StreamPick({ filter: "data" }))
                .pipe(StreamArray());

            collector.on("data", (data: { key: number; value: Anime }) => {
                try {
                    const {
                        sources,
                        title,
                        type,
                        episodes,
                        status,
                        animeSeason: { season, year },
                        picture,
                        thumbnail,
                        synonyms,
                        relations,
                        tags,
                    } = data.value;

                    Database.sql
                        .prepare(
                            `INSERT OR REPLACE INTO ${Database.name} (` +
                                "sources, title, type, episodes, status, season, year, picture, thumbnail, synonyms, relations, tags" +
                                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                        )
                        .run(
                            sources.join(DataSplitter),
                            title,
                            type,
                            episodes,
                            status,
                            season,
                            year,
                            picture,
                            thumbnail,
                            synonyms.join(DataSplitter),
                            relations.join(DataSplitter),
                            tags.join(DataSplitter)
                        );
                } catch (err) {
                    Logger.error(`Failed to update Anime Database! - ${err}`);
                    reject(err);
                }
            });

            collector.on("end", async () => {
                Logger.info("Updated Anime Database!");
                await updateCacheInfo(CacheInfoPath, {
                    lastUpdated: Date.now(),
                });
                resolve();
            });

            collector.on("error", (err) => {
                Logger.error(`Failed to update Anime Database! - ${err}`);
                reject(err);
            });
        } catch (err) {
            Logger.error(`Failed to update Anime Database! - ${err}`);
            reject(err);
        }
    });
};

FetchAndUpdateDatabase();
