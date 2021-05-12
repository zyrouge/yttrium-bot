import path from "path";
import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis, Functions } from "@/util";

const pkjJson = require(path.join(__dirname, "..", "..", "package.json"));

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "help",
            description: "Sends help message",
            aliases: ["cmds", "commands", "hlp"],
            category: "misc",
            args: [], // todo
        },
        async ({ args }) => {
            const allCommands = [...app.plugins.commands.commands.values()];

            const page = args[0] && !isNaN(args[0] as any) ? +args[0] - 1 : 0,
                itemsPerPage = 5;
            const startIndex = page * itemsPerPage;

            const cmds = allCommands.slice(
                startIndex,
                startIndex + itemsPerPage
            );

            if (!cmds.length) {
                return {
                    content: `${Emojis.SAD} | Page **${
                        page + 1
                    }** of the commands is empty!`,
                };
            }

            const embed = new MessageEmbed();

            embed.setTitle(`${Emojis.PAGE} | Commands`);
            embed.setTimestamp();
            embed.setColor(Colors.WHITE);

            cmds.forEach((cmd, i) => {
                embed.addField(
                    `${i + startIndex + 1}) ${Functions.capitalize(cmd.name)}`,
                    [
                        `**Invokers:** ${[cmd.name, ...(cmd.aliases || [])]
                            .map((x) => `\`${x}\``)
                            .join(", ")}`,
                        `**Description:** ${cmd.description}`,
                        `**Category:** ${Functions.capitalize(cmd.category)}`,
                    ]
                        .filter((x) => x)
                        .join("\n")
                );
            });

            embed.setFooter(
                `Page ${page + 1} of ${Math.ceil(
                    allCommands.length / itemsPerPage
                )} | Total commands: ${allCommands.length} | GitHub: ${
                    (pkjJson?.repository?.url as string)?.match(
                        /^git\+(.*).git/
                    )?.[1] || "-"
                } | Author: ${pkjJson?.author || "-"}`
            );

            return { embed };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
