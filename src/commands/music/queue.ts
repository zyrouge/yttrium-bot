import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "queue",
            description: "Shows the current queue",
            aliases: ["q", "songs", "list"],
            category: "music",
            args: [
                {
                    name: "page",
                    alias: "p",
                    type: Number,
                    defaultValue: 1,
                    defaultOption: true,
                    helpDesc: "Page number",
                    helpVal: "number",
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

            const player = app.plugins.music.get(msg.guild!.id);
            if (!player) {
                return {
                    content: `${Emojis.DANGER} | Nothing is being played right now!`,
                };
            }

            const embed = new MessageEmbed();
            embed.setTitle(`${Emojis.MUSIC} | Current queue`);
            embed.setTimestamp();
            embed.setColor(Colors.BLUE);

            const page = args.page - 1;
            if (isNaN(page) || page < 0)
                return {
                    content: `${Emojis.DANGER} | Invalid page number!`,
                };

            const perpage = 5;
            const start = page * perpage;
            const songs = player.queue.slice(start, start + perpage);
            if (!songs.length) {
                return {
                    content: `${Emojis.SAD} | No songs were found on **page ${args.page}**!`,
                };
            }

            const pretty = (t: typeof player.queue[0]) => {
                const content: string[] = [t.title];

                if (t.duration) {
                    content.push(
                        `[${Functions.humanizeDuration(
                            Functions.parseMs(t.duration)
                        )}]`
                    );
                }

                if (t.requester) {
                    content.push(`(<@${t.requester}>)`);
                }

                return content.join(" ");
            };

            const np = player.queue.current;
            if (np) {
                embed.addField(`${Emojis.SOUND} Now playing`, pretty(np));
            }

            embed.setDescription(
                songs
                    .filter((x) => x)
                    .map((x, i) => `${i + 1 + start}. ${pretty(x)}`)
                    .join("\n") + (np ? "\n\n** **" : "")
            );
            embed.setFooter(
                `Page: ${page + 1}/${Math.ceil(
                    player.queue.length / perpage
                )} | Total tracks: ${player.queue.length}`
            );

            return { embed };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
