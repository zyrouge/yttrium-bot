import path from "path";
import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
import { parser as StreamParser } from "stream-json/Parser";
import { streamArray as StreamArray } from "stream-json/streamers/StreamArray";
import { pick as StreamPick } from "stream-json/filters/Pick";
import { BSQLDatabase } from "@/base/database/BSQLDatabase";
import { Constants, Functions, Logger } from "@/util";
import { getCacheInfo, updateCacheInfo } from "@/base/database/CacheInfoFile";

export interface AnimeEntity {
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

export class AnimeDatabase {
    dbDir = path.join(Constants.paths.data, "animedb");
    dbPath = path.join(this.dbDir, "data.db");
    cacheInfoPath = path.join(this.dbDir, "cacheInfo.json");
    maxAliveTime = 21600000;
    dataSplitter = "__,__";

    sql = BSQLDatabase(this.dbPath);
    mainTableName = "anime_db";
    ftsTableName = "anime_db_fts";
    ready = false;
    isBeingUpdated = false;

    constructor() {}

    async prepare() {
        this.sql
            .prepare(
                `CREATE TABLE IF NOT EXISTS ${this.mainTableName} (` +
                    "id integer PRIMARY KEY NOT NULL, " +
                    "sources text NOT NULL, " +
                    "title text NOT NULL, " +
                    "type text NOT NULL, " +
                    "episodes integer NOT NULL, " +
                    "status text NOT NULL, " +
                    "season text NOT NULL, " +
                    "year integer, " +
                    "picture text NOT NULL, " +
                    "thumbnail text NOT NULL, " +
                    "synonyms text NOT NULL, " +
                    "relations text NOT NULL, " +
                    "tags text NOT NULL, " +
                    "UNIQUE(title)" +
                    ");"
            )
            .run();

        this.sql
            .prepare(
                `CREATE VIRTUAL TABLE IF NOT EXISTS ${this.ftsTableName} USING fts5 (` +
                    "title, " +
                    "synonyms, " +
                    "tags, " +
                    `content='${this.mainTableName}', ` +
                    "content_rowid='id'" +
                    ");"
            )
            .run();

        this.ready = true;
        return this.sql;
    }

    async fetchAndUpdateDatabase() {
        if (!this.ready) throw new Error("Anime Database is not ready yet");

        try {
            const cacheInfo = await getCacheInfo(this.cacheInfoPath);
            if (cacheInfo) {
                const expires = cacheInfo.lastUpdated + this.maxAliveTime;
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
                this.isBeingUpdated = true;
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

                collector.on(
                    "data",
                    async (data: { key: number; value: AnimeEntity }) => {
                        try {
                            collector.pause();

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

                            const {
                                changes,
                                lastInsertRowid,
                            } = this.sql
                                .prepare(
                                    `INSERT OR IGNORE INTO ${this.mainTableName} (` +
                                        "sources, title, type, episodes, status, season, year, picture, thumbnail, synonyms, relations, tags" +
                                        ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                                )
                                .run(
                                    sources.join(this.dataSplitter),
                                    title,
                                    type,
                                    episodes,
                                    status,
                                    season,
                                    year,
                                    picture,
                                    thumbnail,
                                    synonyms.join(this.dataSplitter),
                                    relations.join(this.dataSplitter),
                                    tags.join(this.dataSplitter)
                                );

                            if (changes) {
                                this.sql
                                    .prepare(
                                        `INSERT OR IGNORE INTO ${this.ftsTableName} (` +
                                            "rowid, title, synonyms, tags" +
                                            ") VALUES (?, ?, ?, ?);"
                                    )
                                    .run(
                                        lastInsertRowid,
                                        title,
                                        synonyms.join(","),
                                        tags.join(",")
                                    );
                            }

                            await Functions.sleep(50);
                            collector.resume();
                        } catch (err) {
                            this.isBeingUpdated = false;
                            Logger.error(
                                `Failed to update Anime Database! - ${err}`
                            );
                            reject(err);
                        }
                    }
                );

                collector.on("end", async () => {
                    Logger.info("Updated Anime Database!");
                    await updateCacheInfo(this.cacheInfoPath, {
                        lastUpdated: Date.now(),
                    });
                    this.isBeingUpdated = false;
                    resolve();
                });

                collector.on("error", (err) => {
                    this.isBeingUpdated = false;
                    Logger.error(`Failed to update Anime Database! - ${err}`);
                    reject(err);
                });
            } catch (err) {
                this.isBeingUpdated = false;
                Logger.error(`Failed to update Anime Database! - ${err}`);
                reject(err);
            }
        });
    }

    parseDataToEnitity(data: any) {
        const entity: AnimeEntity & {
            id: number;
        } = {
            id: data.id,
            sources: data.sources.split(this.dataSplitter),
            title: data.title,
            type: data.type,
            episodes: data.episodes,
            status: data.status,
            animeSeason: {
                season: data.season,
                year: data.year,
            },
            picture: data.picture,
            thumbnail: data.thumbnail,
            synonyms: data.synonyms.split(this.dataSplitter),
            relations: data.relations.split(this.dataSplitter),
            tags: data.tags.split(this.dataSplitter),
        };

        return entity;
    }

    getAnimeByID(
        id: number
    ):
        | (AnimeEntity & {
              id: number;
          })
        | undefined {
        if (!this.ready || this.isBeingUpdated)
            throw new Error("Anime Database is not ready yet");

        const data = this.sql
            .prepare(`SELECT * FROM ${this.mainTableName} WHERE id = ?`)
            .get(id);
        return data && this.parseDataToEnitity(data);
    }

    searchAnime(term: string) {
        if (!this.ready || this.isBeingUpdated)
            throw new Error("Anime Database is not ready yet");

        const res: {
            id: number;
            title: string;
        }[] = this.sql
            .prepare(
                `SELECT rowid, title FROM ${this.ftsTableName} WHERE ${this.ftsTableName} MATCH ? ORDER BY rank;`
            )
            .get(term);

        return res;
    }
}
