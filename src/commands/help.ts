import path from "path";
import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command, CommandCategories } from "@/base/plugins/commands";
import { Emojis } from "@/utils/emojis";
import { Colors } from "@/utils/colors";
import { StringUtils } from "@/utils/string";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "help",
            description: "Sends help message",
            aliases: ["cmds", "commands", "hlp"],
            category: "misc",
            args: [
                {
                    name: "category",
                    alias: "c",
                    type: String,
                    defaultOption: true,
                    multiple: true,
                    helpDesc: "Command category",
                    helpVal: CommandCategories as any as string[],
                    optional: true,
                },
            ],
        },
        async ({ args, prefix }) => {
            const embed = new MessageEmbed();

            if (!args.category) {
                embed.setTitle(`${Emojis.PAGE} | Help`);
                embed.setDescription(
                    `Available categories: ${CommandCategories.map(
                        (x) => `\`${x}\``
                    ).join(", ")}`
                );
                embed.setFooter(
                    `Use \`${prefix}${command.name} <category>\` to view commands of that category`
                );
                embed.setTimestamp();
                embed.setColor(Colors.WHITE);

                return { embed };
            }

            const cat = args.category.join(" ").toLowerCase();
            if (!CommandCategories.includes(cat)) {
                return {
                    content: `${Emojis.DANGER} | Invalid command category was provided!`,
                };
            }

            const allCommands = [
                ...app.plugins.commands.commands.values(),
            ].filter((x) => x.category === cat);

            embed.setTitle(
                `${Emojis.PAGE} | Category: ${StringUtils.capitalize(cat)}`
            );
            embed.setDescription(
                `Available commands: ${allCommands
                    .map((x) => `\`${x.name}\``)
                    .join(", ")}`
            );
            embed.setFooter(
                `Use \`${prefix}<command> --help\` to view about of that category`
            );
            embed.setTimestamp();
            embed.setColor(Colors.WHITE);

            return { embed };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
