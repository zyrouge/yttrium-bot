import { FetchAndUpdateDatabase as AnimeDB } from "@/base/plugins/animedb/AnimeDatabase";
import { FetchAndUpdateDatabase as AnimeListTop } from "@/base/plugins/animelist/top";
import { Logger } from "@/util";
import { StartPreScheduledJobs } from "../plugins/cron/Runner";

export const PostReadyJobs = () => {
    Logger.info("Running post ready jobs...");

    [AnimeDB, AnimeListTop, StartPreScheduledJobs].forEach((x) => {
        try {
            x();
        } catch (err) {}
    });
};
