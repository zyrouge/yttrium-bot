import path from "path";
import util from "util";
import cp from "child_process";
import pino from "pino";

const pkgJson = require("../package.json");
const exec = util.promisify(cp.exec);

export const Logger = pino();

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
    CHAIN: "⛓️",
    PAPER_PENCIL: "📝",
    HEART: "❤️",
    EIGHTBALL: "🎱",
    THINKING: "🤔",
    CAMERA: "📷",
};

export const Colors = {
    YELLOW: 16767232,
    BLUE: 5940704,
    WHITE: 16711679,
    PURPLE: 14091260,
    PINK: 16711935,
    REDDIT_ORANGE: 16733952,
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
    sleep: util.promisify(setTimeout),
    getHostFromURL: (url: string) =>
        url.match(/https?:\/\/(.*)/)?.[1].split("/")[0] || url,
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
    random: <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)],
};

export const Constants = {
    paths: {
        root: path.resolve(__dirname, ".."),
        get data() {
            return path.join(this.root, "data");
        },
    },
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
        jpgOrPng: /.(jpg|jpeg|png)$/,
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
        animeOfflineDatabase: {
            base: "https://github.com/manami-project/anime-offline-database",
            dataJson:
                "https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json",
        },
        animeQuote: {
            random: "https://animechan.vercel.app/api/random",
        },
        assets: {
            animeBlush:
                "https://raw.githubusercontent.com/zyrouge/yttrium-bot/next/media/images/anime_blush.jpg",
            reddit: "https://www.redditinc.com/assets/images/site/reddit-logo.png",
        },
        nekosLife: {
            baka: "https://nekos.life/api/v2/img/baka",
            cuddle: "https://nekos.life/api/v2/img/cuddle",
            feed: "https://nekos.life/api/v2/img/feed",
            hug: "https://nekos.life/api/v2/img/hug",
            kiss: "https://nekos.life/api/v2/img/kiss",
            pat: "https://nekos.life/api/v2/img/pat",
            poke: "https://nekos.life/api/v2/img/poke",
            smug: "https://nekos.life/api/v2/img/smug",
            tickle: "https://nekos.life/api/v2/img/tickle",
            slap: "https://nekos.life/api/v2/img/slap",
        },
        someRandomAPI: {
            wink: "https://some-random-api.ml/animu/wink",
        },
        animeGirlsHoldingProgrammingBooks: {
            base: "https://github.com/laynH/Anime-Girls-Holding-Programming-Books",
            contentsApi:
                "https://api.github.com/repos/laynH/Anime-Girls-Holding-Programming-Books/git/trees/master?recursive=1",
            rawBase:
                "https://raw.githubusercontent.com/laynH/Anime-Girls-Holding-Programming-Books/master",
        },
    },
    cron: {
        every6hours: "0 */6 * * *",
        every12hours: "0 */12 * * *",
    },
    kawaiiFaces: [
        "(◠‿◠✿)",
        "（＊＾Ｕ＾）人（≧Ｖ≦＊）/",
        "＼（＾○＾）人（＾○＾）／",
        "ヾ(＠⌒▽⌒＠)ﾉ",
        "≧◡≦",
        "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
        "(づ｡◕‿‿◕｡)づ",
        "＼(*^▽^*)/",
        "(◠△◠✿)",
    ],
};
