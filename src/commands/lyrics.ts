import { search, SearchSongEnitity, getTrack } from "azlyrics-ext";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/utils/emojis";
import { Duration } from "@/utils/duration";
import { PromiseUtils } from "@/utils/promise";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "lyrics",
            description: "Sends lyrics of the specified song!",
            aliases: ["ly"],
            category: "music",
            args: [
                {
                    name: "terms",
                    alias: "t",
                    type: String,
                    multiple: true,
                    defaultOption: true,
                    helpDesc: "Search terms to be resolved",
                    helpVal: "search",
                    optional: false,
                },
            ],
        },
        async ({ msg, args }) => {
            if (!args.terms) {
                return {
                    content: `${Emojis.DANGER} | Provide some arguments to resolve songs!`,
                };
            }

            try {
                msg.react(Emojis.SEARCH).catch(() => {});

                const terms = args.terms.join(" ");
                const [, [song] = []] = await PromiseUtils.await(search(terms));
                if (!song) {
                    return {
                        content: `${Emojis.SAD} | Couldn't find the song!`,
                    };
                }

                const [, track] = await PromiseUtils.await(getTrack(song.url));
                if (!track?.lyrics.length) {
                    return {
                        content: `${Emojis.SAD} | Couldn't find lyrics of the song!`,
                    };
                }

                const maxLength = 1500;
                const pages: string[] = [
                    `${Emojis.MUSIC} | Lyrics of **${song.title}** by **${song.artist}**\n\n`,
                ];

                track.lyrics
                    .split("\n")
                    .filter((x) => !x.startsWith("[") && !x.endsWith("]"))
                    .forEach((line) => {
                        let i = pages.length - 1;
                        if (i < 0) i = 0;
                        if (
                            pages[i] &&
                            pages[i].length + line.length > maxLength
                        )
                            i = i + 1;
                        if (!pages[i]) pages[i] = "";
                        pages[i] += `${line}\n`;
                    });

                for (const page of pages) {
                    msg.reply(page);
                    await Duration.sleep(250);
                }
            } catch (err) {
                return {
                    content: `${Emojis.DANGER} | Something went wrong! (${err})`,
                };
            }
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
