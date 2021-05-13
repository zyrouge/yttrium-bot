import path from "path";
import fs from "fs-extra";
import axios from "axios";
import { getCacheInfo, updateCacheInfo } from "@/base/database/CacheInfoFile";
import { Constants, Functions, Logger } from "@/util";

export let ImagesCache: string[] | undefined = undefined;

export class AnimeGirlsHoldingProgrammingBooks {
    dataDir = path.join(Constants.paths.data, "animegirlbooks", "top");
    dbPath = path.join(this.dataDir, "images.json");
    cacheInfoPath = path.join(this.dataDir, "cacheInfo.json");
    maxAliveTime = 86400000;

    ready = false;
    isBeingUpdated = false;

    constructor() {}

    async prepare() {
        await fs.ensureDir(this.dataDir);

        this.ready = true;
    }

    async fetchAndUpdateDatabase() {
        if (!this.ready)
            throw new Error("Anime girl holding books is not ready yet");

        try {
            const cacheInfo = await getCacheInfo(this.cacheInfoPath);
            if (cacheInfo) {
                const expires = cacheInfo.lastUpdated + this.maxAliveTime;
                if (expires > Date.now()) {
                    const data = await fs.readFile(this.dbPath);
                    ImagesCache = JSON.parse(data.toString()) as string[];
                    return Logger.info(
                        `Skipping Anime girl holding books update as it up-to-date! Remaining time: ${Functions.humanizeDuration(
                            Functions.parseMs(expires - Date.now())
                        )}`
                    );
                }
            }
        } catch (err) {}

        try {
            this.isBeingUpdated = true;
            Logger.info("Updating Anime girl holding books...");

            ImagesCache = await this.fetchAllImages();

            await fs.writeFile(
                this.dbPath,
                JSON.stringify(ImagesCache, null, 4)
            );
            Logger.info("Updated Anime girl holding books!");
            await updateCacheInfo(this.cacheInfoPath, {
                lastUpdated: Date.now(),
            });
            this.isBeingUpdated = false;
        } catch (err) {
            this.isBeingUpdated = false;
            Logger.error(`Failed to update Anime girl holding books! - ${err}`);
        }
    }

    async fetchAllImages() {
        try {
            const { data } = await axios.get<any>(
                Constants.urls.animeGirlsHoldingProgrammingBooks.contentsApi,
                {
                    responseType: "json",
                }
            );

            const images: string[] = data.tree
                .map(
                    (x: any) =>
                        `${Constants.urls.animeGirlsHoldingProgrammingBooks.rawBase}/${x.path}`
                )
                .filter((x: string) => Constants.regex.jpgOrPng.test(x));

            return images;
        } catch (err) {
            throw err;
        }
    }

    random() {
        if (!ImagesCache || !this.ready || this.isBeingUpdated)
            throw new Error("Anime girl holding books is not ready yet");

        return Functions.random(ImagesCache);
    }
}
