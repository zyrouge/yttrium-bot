import axios from "axios";
import util from "util";

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
};

export const Constants = {
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
