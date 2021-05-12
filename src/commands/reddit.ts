import { Message } from "discord.js";
import { AppFile } from "@/base/app";
import { Command, CommandRun } from "@/base/plugins/commands";
import {
    Reddit,
    RedditPost,
    getRedditEmbed,
} from "@/base/plugins/reddit/Reddit";
import { Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const run = async (
        msg: Message,
        reddit: string
    ): ReturnType<CommandRun> => {
        try {
            msg.react(Emojis.TIMER).catch(() => {});

            let post: RedditPost;
            try {
                post = await Reddit(reddit);
            } catch (err) {
                return {
                    content: `${Emojis.SAD} | Unable to fetch the subreddit! (${err})`,
                };
            }

            const embed = getRedditEmbed(post);
            return { embed };
        } catch (err) {
            return {
                content: `${Emojis.DANGER} | Something went wrong! (${err})`,
            };
        }
    };

    const command = new Command(
        {
            name: "reddit",
            description: "Random reddit post from the subreddit",
            aliases: ["subreddit", "sreddit"],
            category: "image",
            args: [
                {
                    name: "subreddit",
                    alias: "s",
                    type: String,
                    multiple: true,
                    defaultOption: true,
                    helpDesc: "Name of the subreddit",
                    helpVal: "subreddit",
                    optional: false,
                },
            ],
        },
        async ({ msg, args }) => {
            if (!args.subreddit) {
                return {
                    content: `${Emojis.DANGER} | Provide a subreddit's name to fetch!`,
                };
            }

            return run(msg, args.subreddit.join("_"));
        }
    );

    app.plugins.commands.add(command);

    const extras: (Omit<Command, "run"> & { reddit: string[] })[] = [
        {
            name: "meme",
            description: "Memes fetched from reddit",
            aliases: ["memes", "dankmeme", "dankmemes"],
            category: "image",
            args: [],
            reddit: [
                "MemeEconomy",
                "ComedyCemetery",
                "memes",
                "dankmemes",
                "PrequelMemes",
                "terriblefacebookmemes",
                "funny",
                "teenagers",
            ],
        },
        {
            name: "joke",
            description: "Jokes fetched from reddit",
            aliases: ["jokes", "dankjokes", "dankjoke"],
            category: "image",
            args: [],
            reddit: ["jokes", "dadjokes", "cleanjokes"],
        },
    ];

    extras.forEach((props) => {
        const reddits = props.reddit;
        // @ts-ignore
        delete props.reddit;

        const cmd = new Command(props, ({ msg }) =>
            run(msg, Functions.random(reddits))
        );

        app.plugins.commands.add(cmd);
    });
};

export default fn;
