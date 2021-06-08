import { MessageEmbed } from "discord.js";
import {
    Track as ErelaTrack,
    SearchResult as ErelaSearchResult,
} from "erela.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "play",
            description: "Plays/Adds a song to the queue",
            aliases: ["pl"],
            category: "music",
            args: [
                {
                    name: "terms",
                    alias: "t",
                    type: String,
                    multiple: true,
                    defaultOption: true,
                    helpDesc: "Song track name or url",
                    helpVal: "song",
                    optional: false,
                },
                {
                    name: "search",
                    alias: "s",
                    type: Boolean,
                    helpDesc: "Should prompt for selection",
                    helpVal: "",
                    optional: true,
                },
            ],
        },
        async ({ msg, args }) => {
            if (!msg.member?.voice.channel) {
                return {
                    content: `${Emojis.DANGER} | You must be in a Voice Channel to use this command!`,
                };
            }

            if (
                msg.guild?.me?.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                return {
                    content: `${Emojis.DANGER} | You must be in the same Voice Channel to use this command!`,
                };
            }

            if (!args.terms) {
                return {
                    content: `${Emojis.DANGER} | Provide some search terms to fetch results!`,
                };
            }

            msg.react(Emojis.SEARCH).catch(() => {});

            let res: ErelaSearchResult;
            try {
                res = await app.plugins.music.search(
                    args.terms.join(" "),
                    msg.author
                );
            } catch (err) {
                return {
                    content: `${Emojis.SAD} | Something went wrong! (${err?.message})`,
                };
            }

            if (res.loadType === "LOAD_FAILED") {
                return {
                    content: `${Emojis.SAD} | Something went wrong! (${res.exception?.message})`,
                };
            }

            if (res.loadType !== "PLAYLIST_LOADED") {
                if (args.search) {
                    res.tracks = res.tracks.slice(0, 10);

                    const selectEmbed = new MessageEmbed();
                    selectEmbed.setTitle(`${Emojis.MUSIC} | Track selection`);
                    selectEmbed.setDescription(
                        res.tracks
                            .slice(0, 10)
                            .map(
                                (t, i) => `${i + 1}. **[${t.title}](${t.uri})**`
                            )
                            .join("\n")
                    );
                    selectEmbed.setTimestamp();
                    selectEmbed.setColor(Colors.BLUE);
                    selectEmbed.setFooter(`Send an index between 1 and 10`);

                    const selectMsg = await msg.channel.send(selectEmbed);
                    const selectedIndex = await msg.channel
                        .awaitMessages(
                            (amsg) => {
                                if (amsg.author.id !== msg.author.id)
                                    return false;

                                const i = +amsg.content;
                                if (i > 0 && i <= res.tracks.length)
                                    return true;

                                return false;
                            },
                            {
                                max: 1,
                                time: 15 * 1000,
                                errors: ["time"],
                            }
                        )
                        .then((amsgs) => +amsgs.first()!.content - 1)
                        .catch(() => null);

                    if (typeof selectedIndex !== "number") {
                        return {
                            content: `${Emojis.SAD} | No valid index was provided!`,
                        };
                    }

                    if (!res.tracks[selectedIndex]) {
                        return {
                            content: `${Emojis.SAD} | Invalid index was provided!`,
                        };
                    }

                    res.tracks = res.tracks.slice(
                        selectedIndex,
                        selectedIndex + 1
                    );
                    selectMsg.delete().catch(() => {});
                } else {
                    res.tracks = res.tracks.slice(0, 1);
                }
            }

            if (!res.tracks.length) {
                return {
                    content: `${
                        Emojis.SAD
                    } | No results were found for **${args.terms.join(" ")}**!`,
                };
            }

            const player = app.plugins.music.create({
                guild: msg.guild!.id,
                voiceChannel: msg.member.voice.channel.id,
                textChannel: msg.channel.id,
            });

            if (!["CONNECTED", "CONNECTING"].includes(player.state)) {
                player.connect();
            }

            res.tracks.forEach((track) => {
                player.queue.add(
                    Object.assign(track, {
                        requester: msg.author.id,
                    })
                );
            });

            if (!player.playing && !player.paused && !player.queue.size) {
                player.play();
            }

            return {
                content: `${Emojis.MUSIC} | **${
                    res.playlist?.name || res.tracks[0].title
                }** has been added to the queue!`,
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
