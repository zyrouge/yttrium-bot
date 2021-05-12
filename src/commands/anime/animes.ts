import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis, Constants, Functions, Colors } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "anime",
            description: "Shows/searches anime",
            aliases: ["searchanime", "sanime", "sanimes", "animes"],
            category: "anime",
            args: [
                {
                    name: "id",
                    type: Number,
                    defaultValue: null,
                    helpDesc: "ID of the anime",
                    optional: true,
                },
                {
                    name: "term",
                    alias: "t",
                    type: String,
                    multiple: true,
                    defaultOption: true,
                    helpDesc: "Keywords of the anime",
                    helpVal: "anime",
                    optional: true,
                },
            ],
        },
        async ({ msg, args, prefix }) => {
            try {
                msg.react(Emojis.TIMER).catch(() => {});

                if (typeof args.id === "number") {
                    if (isNaN(args.id)) {
                        return {
                            content: `${Emojis.SAD} | Invalid anime ID was provided!`,
                        };
                    }

                    const anime = app.plugins.animedb.getAnimeByID(args.id);
                    if (!anime) {
                        return {
                            content: `${Emojis.SAD} | Could not get anime with ID **${args.id}**!`,
                        };
                    }

                    const embed = new MessageEmbed();
                    embed.setTitle(`${Emojis.WHITE_FLOWER} | ${anime.title}`);
                    embed.setColor(Colors.PURPLE);
                    embed.setDescription(
                        [
                            `**ID**: ${anime.id}`,
                            `**Title**: ${anime.title}`,
                            `**Episodes**: ${
                                anime.episodes
                            } (${Functions.capitalize(anime.status)})`,
                            `**Season**: ${
                                anime.animeSeason.season === "UNDEFINED"
                                    ? "Unknown"
                                    : Functions.capitalize(
                                          anime.animeSeason.season
                                      )
                            }`,
                            `**Aired year**: ${anime.animeSeason.year}`,
                            `**Sources**: ${anime.sources
                                .slice(0, 3)
                                .map(
                                    (x) =>
                                        `[${Functions.getHostFromURL(x)}](${x})`
                                )
                                .join(", ")}`,
                            `**Tags**: ${Functions.shorten(
                                anime.tags.join(", "),
                                500
                            )}`,
                        ].join("\n")
                    );
                    embed.setThumbnail(anime.thumbnail);
                    embed.setImage(anime.picture);
                    embed.setTimestamp();

                    return { embed };
                }

                if (!args.term) {
                    return {
                        content: `${Emojis.DANGER} | Nothing was provided to perform a search!`,
                    };
                }

                const terms = args.term.join(" ");
                if (terms.length < 3) {
                    return {
                        content: `${Emojis.DANGER} | Provide atleast a word with 3 letters to search!`,
                    };
                }

                const animes = app.plugins.animedb.searchAnime(terms);
                if (!animes) {
                    return {
                        content: `${Emojis.SAD} | No results were found for **${terms}**!`,
                    };
                }

                const embed = new MessageEmbed();
                embed.setTitle(
                    `${Emojis.WHITE_FLOWER} | Anime results for ${terms}`
                );
                embed.setDescription(
                    animes
                        .map((x) => `ID: \`${x.id}\` **${x.title}**`)
                        .join("\n")
                );
                embed.setColor(Colors.YELLOW);
                embed.setTimestamp();
                embed.setFooter(
                    `Use \`${prefix}${command.name} --id <id>\` to view the anime`
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
