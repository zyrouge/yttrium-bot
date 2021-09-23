import path from "path";
import fs from "fs-extra";
import axios from "axios";
import { getCacheInfo, updateCacheInfo } from "@/base/database/CacheInfoFile";
import { Duration } from "@/utils/duration";
import { Logger } from "@/utils/logger";
import { Paths } from "@/utils/paths";
import { RegExpUtils } from "@/utils/regex";
import { ArrayUtils } from "@/utils/array";
import { PromiseUtils } from "@/utils/promise";

export let ImagesCache: string[] | undefined = undefined;

export class AnimeGirlsHoldingProgrammingBooks {
    dataDir = path.join(Paths.data, "animegirlbooks", "top");
    dbPath = path.join(this.dataDir, "images.json");
    cacheInfoPath = path.join(this.dataDir, "cacheInfo.json");
    maxAliveTime = 86400000;

    ready = false;
    isBeingUpdated = false;

    endpoint = {
        base: "https://github.com/laynH/Anime-Girls-Holding-Programming-Books",
        contentsApi:
            "https://api.github.com/repos/laynH/Anime-Girls-Holding-Programming-Books/git/trees/master?recursive=1",
        rawBase:
            "https://raw.githubusercontent.com/laynH/Anime-Girls-Holding-Programming-Books/master",
    };

    async prepare() {
        await fs.ensureDir(this.dataDir);

        this.ready = true;
    }

    async fetchAndUpdateDatabase() {
        if (!this.ready)
            throw new Error("Anime girl holding books is not ready yet");

        const [, cacheInfo] = await PromiseUtils.await(
            getCacheInfo(this.cacheInfoPath)
        );
        if (cacheInfo) {
            const expires = cacheInfo.lastUpdated + this.maxAliveTime;
            if (expires > Date.now()) {
                const data = await fs.readFile(this.dbPath);
                ImagesCache = JSON.parse(data.toString()) as string[];
                return Logger.info(
                    `Skipping Anime girl holding books update as it up-to-date! Remaining time: ${Duration.humanize(
                        Duration.parseMs(expires - Date.now())
                    )}`
                );
            }
        }

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
        const { data } = await axios.get<any>(this.endpoint.contentsApi, {
            responseType: "json",
        });

        const images: string[] = data.tree
            .map((x: any) => `${this.endpoint.rawBase}/${x.path}`)
            .filter((x: string) => RegExpUtils.jpgOrPng.test(x));

        return images;
    }

    random() {
        if (!ImagesCache || !this.ready || this.isBeingUpdated)
            throw new Error("Anime girl holding books is not ready yet");

        return ArrayUtils.random(ImagesCache);
    }
}
