import axios from "axios";
import util from "util";
import cp from "child_process";

const pkgJson = require("../package.json");
const exec = util.promisify(cp.exec);

export const Emojis = {
    TIMER: "⌛",
    PING_PONG: "🏓",
    DANGER: "🚫",
    MUSIC: "🎶",
    SEARCH: "🔎",
    SUCCESS: "👍",
    SAD: "😔",
    PLAY: "▶️",
    PAUSE: "⏸️",
    WAVE: "👋",
    REPEAT: "🔄",
    SINGLE_REPEAT: "🔂",
    TICK: "✅",
    CROSS: "❌",
    INFO: "🔖",
    SOUND: "🔊",
    PAGE: "📄",
    WHITE_FLOWER: "💮",
    SYSTEM: "💻",
    BOT: "🤖",
};

export const Colors = {
    YELLOW: 16767232,
    BLUE: 5940704,
    WHITE: 16711679,
    PURPLE: 14091260,
};

export const Functions = {
    clean: (text: string) =>
        text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203)),
    shorten: (text: string, length: number, dots: boolean = true) =>
        text.length > length
            ? text.slice(0, length - 3) + (dots ? "..." : "")
            : text,
    chunk: <T>(arr: T[], slices: number): T[][] => [
        arr.slice(0, slices),
        ...(arr.length - slices > 0
            ? Functions.chunk(arr.slice(slices), slices)
            : []),
    ],
    capitalize: (text: string) =>
        text
            .split(" ")
            .map((x) => `${x[0].toUpperCase()}${x.slice(1)}`)
            .join(" "),
    shuffle: <T>(arr: T[]): T[] => arr.sort((a, b) => Math.random() - 0.5),
    http: axios,
    sleep: util.promisify(setTimeout),
    getHostFromURL: (url: string) =>
        url.match(/https?:\/\/(.*)\/?/)?.[1] || url,
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
    humanizeDuration: ({ days, hours, mins, secs }: any) => {
        const human = [];
        if (days) human.push(`${days}d`);
        if (hours) human.push(`${hours}h`);
        if (mins) human.push(`${mins}m`);
        if (secs) human.push(`${secs}s`);
        return human.join(" ");
    },
    async getSHA() {
        if (Constants.project.sha) return Constants.project.sha;
        if (Constants.project.github === "Unknown") return null;
        const { stdout } = await exec(
            `git ls-remote ${Constants.project.github}.git refs/heads/main`
        );
        const sha = (Constants.project.sha =
            stdout.match(/\w+/)?.[0] || "Unknown");
        return sha;
    },
};

export const Constants = {
    project: {
        codeName: pkgJson.name as string,
        version: pkgJson.version as string,
        github: (pkgJson.repository?.url?.replace(/^(git\+)|(.git)$/g, "") ||
            "Unknown") as string,
        author: (pkgJson.author || "Unknown") as string,
        sha: null as string | null,
    },
    http: {
        UserAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    },
    regex: {
        discordMention: (id: string = "\\d+", flags?: string) =>
            new RegExp(`<@!?${id}>`, flags),
        url: /^(https?:\/\/)/,
    },
    urls: {
        animeList: {
            base: "https://myanimelist.net",
            top(filter?: string) {
                let out = `${this.base}/topanime.php`;
                if (filter) out += `?type=${filter}`;
                return out;
            },
        },
    },
};
