import { CronJob } from "cron";
import { App } from "@/base/app";
import { Logger } from "@/utils/logger";
import { PromiseUtils } from "@/utils/promise";

export interface PreScheduledJobEnitity {
    time: string;
    jobs: (() => any)[];
}

export interface RunnerEnitity {
    name: string;
    time: string;
    runner: CronJob;
}

export class CronRunner {
    app: App;
    runners: RunnerEnitity[] = [];

    constructor(app: App) {
        this.app = app;
    }

    addJob(name: string, time: string, fn: () => any) {
        const runner = new CronJob(
            time,
            () => {
                Logger.info(`Started CronJob: ${name} [${time}]!`);
                PromiseUtils.awaitFn(fn);
            },
            () => {
                Logger.info(`Finished CronJob: ${name} [${time}]!`);
            }
        );

        this.runners.push({
            name,
            time,
            runner,
        });
    }
}
