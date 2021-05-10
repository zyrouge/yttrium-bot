import { Message } from "discord.js";
import { Client as GeniusClient } from "genius-lyrics";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Constants, Emojis, Functions } from "@/util";

const genius = new GeniusClient(undefined, {
    requestOptions: {
        headers: {
            "User-Agent": Constants.http.UserAgent,
        },
    },
});

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
                },
            ],
        },
        async ({ msg, args }) => {
            if (!args.terms)
                return msg.channel.send(
                    `${Emojis.DANGER} | Provide some arguments to resolve songs!`
                );

            let nmsg: Message | undefined;
            try {
                const terms = args.terms.join(" ");
                const nmsg = await msg.channel.send(
                    `${Emojis.SEARCH} | Searching lyrics for \`${terms}\`...`
                );

                const song = (await genius.songs.search(terms))?.[0];
                if (!song)
                    return nmsg.edit(`${Emojis.SAD} | Couldn't find the song!`);

                const lyrics = await song.lyrics();
                if (!lyrics?.length)
                    return nmsg.edit(
                        `${Emojis.SAD} | Couldn't find lyrics of the song!`
                    );

                const maxLength = 1500;
                const pages: string[] = [
                    `${Emojis.MUSIC} | Lyrics of **${song.featuredTitle}** by **${song.artist.name}**\n\n`,
                ];

                lyrics
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

                nmsg.delete().catch(() => {});
                for (const page of pages) {
                    msg.channel.send(page);
                    await Functions.sleep(250);
                }
            } catch (err) {
                const content = `${Emojis.DANGER} | Something went wrong! (${
                    err?.message ? err.message : err.toString()
                })`;
                if (nmsg && nmsg.editable) return nmsg.edit(content);
                return msg.channel.send(content);
            }
        }
    );

    app.commands.add(command);
};

export default fn;
