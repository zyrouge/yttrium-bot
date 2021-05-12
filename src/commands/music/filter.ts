import { MessageEmbed } from "discord.js";
import { AudioFilters } from "discord-player/lib/utils/AudioFilters";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis, Functions } from "@/util";

const allFilters = AudioFilters.names;

// Changing filter values
AudioFilters.bassboost = "bass=g=15";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "filter",
            description: "Enables/Disables filters",
            aliases: ["fl", "fx", "effects", "filters", "effect"],
            category: "music",
            args: [
                {
                    name: "filter",
                    alias: "f",
                    type: String,
                    defaultOption: true,
                    multiple: true,
                },
            ],
        },
        async ({ msg, args, prefix }) => {
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

            const queue = app.plugins.music.getQueue(msg);
            if (!queue) {
                return {
                    content: `${Emojis.DANGER} | Nothing is being played right now!`,
                };
            }

            const invalidFilters: string[] = [];
            if (args.filter) {
                const newFilters: Record<string, boolean> = {};

                for (const arg of args.filter) {
                    const filter = allFilters.find(
                        (x) => x.toLowerCase() === arg.toLowerCase()
                    );
                    if (!filter) {
                        invalidFilters.push(arg);
                        continue;
                    }

                    // @ts-ignore
                    newFilters[filter] = !queue.filters[filter];
                }

                if (Object.keys(newFilters).length) {
                    msg.react(Emojis.TIMER).catch(() => {});
                    await app.plugins.music.setFilters(msg, newFilters);
                }
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
                    `${Emojis.DANGER} Invalid Filters`,
                    `Could not add these filters: ${invalidFilters
                        .map((x) => `\`${x}\``)
                        .join(", ")}`
                );

            embed.setTimestamp();
            embed.setColor(Colors.BLUE);
            embed.addField(
                `${Emojis.INFO} Tip`,
                `Use \`${prefix}${command.name} [filter1, filter2, ...]\` to add or remove filters!`
            );

            return { embed };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
