import { CronJob } from "cron";
import { Constants, Logger } from "@/util";
import { FetchAndUpdateDatabase as AnimeDB } from "@/base/plugins/animedb/AnimeDatabase";
import { FetchAndUpdateDatabase as AnimeListTop } from "@/base/plugins/animelist/top";

export interface PreScheduledJobEnitity {
    time: string;
    jobs: (() => any)[];
}

export const PreScheduledJobs: PreScheduledJobEnitity[] = [
    {
        time: Constants.cron.every6hours,
        jobs: [AnimeDB, AnimeListTop],
    },
];

export interface RunnerEnitity {
    time: string;
    runner: CronJob;
}

export const Runners: RunnerEnitity[] = [];

export const StartPreScheduledJobs = () => {
    PreScheduledJobs.forEach(({ time, jobs }) => {
        const runner = new CronJob(
            time,
            () => {
                Logger.info(`Started CronJob: ${time}!`);
                jobs.forEach((x) => {
                    try {
                        x();
                    } catch (err) {}
                });
            },
            () => {
                Logger.info(`Finished CronJob: ${time}!`);
            }
        );

        Runners.push({
            time,
            runner,
        });
    });
};
