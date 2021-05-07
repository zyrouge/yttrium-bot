import { MessageEmbed } from "discord.js";
import { AudioFilters } from "discord-player/lib/utils/AudioFilters";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis, Functions } from "@/util";

const allFilters = AudioFilters.names;

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "filter",
            description: "Enables/Disables filters",
            aliases: ["fl", "fx", "effects", "filters", "effect"],
            category: "music",
        },
        async ({ msg, args, prefix }) => {
            if (!msg.member?.voice.channel)
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in a Voice Channel to use this command!`
                );

            if (
                msg.guild?.me?.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            )
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in the same Voice Channel to use this command!`
                );

            const queue = app.music.getQueue(msg);
            if (!queue)
                return msg.channel.send(
                    `${Emojis.DANGER} | Nothing is being played right now!`
                );

            const invalidFilters: string[] = [];

            if (args.length) {
                const newFilters: Record<string, boolean> = {};

                for (let filter of args) {
                    filter = filter.toLowerCase();

                    if (!allFilters.includes(filter)) {
                        invalidFilters.push(filter);
                        continue;
                    }

                    // @ts-ignore
                    newFilters[filter] = !queue.filters[filter];
                }

                await app.music.setFilters(msg, newFilters);
            }

            const embed = new MessageEmbed();

            embed.setTitle(`${Emojis.MUSIC} | Filters`);
            embed.setDescription(
                allFilters
                    .map((f) => {
                        // @ts-ignore
                        const isEnabled = !!queue.filters[f];
                        return `**${Functions.capitalize(f)}**: ${
                            isEnabled ? Emojis.TICK : Emojis.CROSS
                        }`;
                    })
                    .join("\n")
            );

            if (invalidFilters.length)
                embed.addField(
                    "Invalid Filters",
                    `Could not add these filters: ${invalidFilters
                        .map((x) => `\`${x}\``)
                        .join(", ")}`
                );

            embed.setTimestamp();
            embed.setColor(Colors.BLUE);
            embed.addField(
                "Tip",
                `Use \`${prefix}${command.name} [filter1, filter2, ...]\` to add or remove filters!`
            );

            msg.channel.send({ embed });
        }
    );

    app.commands.add(command);
};

export default fn;
