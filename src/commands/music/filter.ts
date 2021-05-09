import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { createCommand } from "@/base/plugins/commands";
import { AudioFilters } from "@/base/plugins/music/filters";
import { Colors, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const command = createCommand(
        {
            name: "filter",
            description: "Enables/Disables filters",
            aliases: ["fl", "fx", "effects", "filters", "effect"],
            category: "music",
        },
        async ({ msg, args, prefix }) => {
            if (!msg.member.voice.channel)
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in a Voice Channel to use this command!`
                );
            if (
                msg.guild.me?.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            )
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in the same Voice Channel to use this command!`
                );

            const queue = app.music.get(msg.guild.id);
            if (!queue)
                return msg.channel.send(
                    `${Emojis.DANGER} | Nothing is being played right now!`
                );

            const validFilters = Object.keys(AudioFilters).map((x) =>
                x.toLowerCase()
            );
            const invalidFilters: string[] = [];
            if (args.length) {
                let newFilters: string[] = [...queue.filters.values()];
                let changes = false;

                for (let arg of args) {
                    arg = arg.toLowerCase();

                    if (!validFilters.includes(arg)) {
                        invalidFilters.push(arg);
                        continue;
                    }

                    changes = true;
                    if (newFilters.includes(arg))
                        newFilters = newFilters.filter((f) => f !== arg);
                    else newFilters.push(arg);
                }

                if (changes) queue.setFilters(newFilters);
            }

            const allFilters = queue.formattedFilters();
            const embed = new MessageEmbed();
            embed.setTitle(`${Emojis.MUSIC} | Filters`);
            embed.setDescription(
                Object.entries(allFilters)
                    .map(([f, enabled]) => {
                        return `**${Functions.capitalize(f)}**: ${
                            enabled ? Emojis.TICK : Emojis.CROSS
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
            msg.channel.send({ embed });
        }
    );
    app.commands.add(command);
};

export default fn;
