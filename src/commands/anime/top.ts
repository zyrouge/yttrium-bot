import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { TopAnimeTypes, TopAnimeTypesType } from "@/base/plugins/animelist/Top";
import { Emojis, Constants, Functions, Colors } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "topanimes",
            description: "Shows top animes",
            aliases: ["topanime", "tanime", "tanimes"],
            category: "anime",
            args: [
                {
                    name: "type",
                    alias: "t",
                    type: String,
                    defaultValue: null,
                    defaultOption: true,
                    helpDesc: "Anime category",
                    helpVal: (TopAnimeTypes as any) as string[],
                    optional: true,
                },
                {
                    name: "page",
                    alias: "p",
                    type: Number,
                    defaultValue: null,
                    helpDesc: "Page number to be viewed",
                    helpVal: "number",
                    optional: true,
                },
            ],
        },
        async ({ msg, args }) => {
            try {
                const type = args.type?.toLowerCase() as TopAnimeTypesType;
                if (type && !TopAnimeTypes.includes(type)) {
                    return {
                        content: `${
                            Emojis.DANGER
                        } | Invalid anime list category! Available categories: ${TopAnimeTypes.map(
                            (x) => `\`${x}\``
                        ).join(", ")}`,
                    };
                }

                msg.react(Emojis.TIMER).catch(() => {});
                const all = app.plugins.animelist.getAnimes({
                    type: !!type && type,
                });

                const embed = new MessageEmbed();
                embed.setTitle(
                    `${
                        Emojis.WHITE_FLOWER
                    } | Top animes (${Functions.capitalize(type || "all")})`
                );

                const page =
                    typeof args.page === "number" && !isNaN(args.page)
                        ? args.page - 1
                        : 0;
                const itemsPerPage = 8;
                const startIndex = page * itemsPerPage;
                const animes = all.slice(startIndex, startIndex + itemsPerPage);
                if (!animes.length) {
                    return {
                        content: `${Emojis.SAD} | Page **${
                            page + 1
                        }** is empty!`,
                    };
                }

                embed.addFields(
                    ...animes.map((x) => ({
                        name: `#${x.rank} - ${x.title}`,
                        value: [
                            `**Score**: ${x.score}`,
                            `**Type**: ${Functions.capitalize(x.series)}`,
                            `**Aired**: ${x.run}`,
                            `**Link**: [${Functions.getHostFromURL(
                                Constants.urls.animeList.base
                            )}](${x.url})`,
                        ].join("\n"),
                    }))
                );

                embed.setColor(Colors.PURPLE);
                embed.setTimestamp();
                embed.setFooter(
                    `Page: ${page + 1}/${Math.ceil(
                        all.length / itemsPerPage
                    )} | Source: ${Constants.urls.animeList.base}`
                );

                return { embed };
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
