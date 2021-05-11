import os from "os";
import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Constants, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "botinformation",
            description: "Sends bot's information",
            aliases: ["botinfo", "statistics", "stats"],
            category: "misc",
            args: [],
        },
        async ({ msg }) => {
            const embed = new MessageEmbed();

            embed.setTitle(`${Emojis.INFO} | Information`);

            embed.addField(
                `${Emojis.BOT} Bot`,
                [
                    `**Tag**: ${app.bot.user?.tag} (\`${Constants.project.codeName}\`)`,
                    `**ID**: ${app.bot.user?.id}`,
                    `**Author**: ${Constants.project.author}`,
                    `**Source Code**: [GitHub](${Constants.project.github})`,
                ].join("\n")
            );

            embed.addField(
                `${Emojis.SYSTEM} System`,
                [
                    `**Uptime**: ${Functions.humanizeDuration(
                        Functions.parseMs(os.uptime())
                    )}`,
                    `**Platform**: ${Functions.capitalize(os.platform())}`,
                    `**CPU**: ${[
                        ...new Set(os.cpus().map((x) => x.model)),
                    ].join(", ")}`,
                    `**Architecture**: ${os.arch()}`,
                    `**Memory**: ${(os.freemem() / (1024 * 1024)).toFixed(
                        2
                    )}gb left out of ${(os.totalmem() / (1024 * 1024)).toFixed(
                        2
                    )}gb`,
                ].join("\n")
            );

            embed.setColor(Colors.WHITE);
            embed.setTimestamp();

            msg.reply({ embed });
        }
    );

    app.commands.add(command);
};

export default fn;