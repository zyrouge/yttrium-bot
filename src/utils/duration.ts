import { promisify } from "util";

export const Duration = {
    parseMs: (ms: number) => {
        let secs = ms / 1000;

        const days = secs / (24 * 60 * 60);
        secs %= 24 * 60 * 60;

        const hours = secs / (60 * 60);
        secs %= 60 * 60;

        const mins = secs / 60;
        secs %= 60;

        return {
            days: Math.trunc(days),
            hours: Math.trunc(hours),
            mins: Math.trunc(mins),
            secs: Math.trunc(secs),
        };
    },
    humanize: ({ days, hours, mins, secs }: any) => {
        const human = [];
        if (days) human.push(`${days}d`);
        if (hours) human.push(`${hours}h`);
        if (mins) human.push(`${mins}m`);
        if (secs) human.push(`${secs}s`);
        return human.join(" ");
    },
    sleep: promisify(setTimeout),
};
