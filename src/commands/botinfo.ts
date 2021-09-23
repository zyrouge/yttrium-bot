import os from "os";
import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/utils/emojis";
import { Colors } from "@/utils/colors";
import { Duration } from "@/utils/duration";
import { Project } from "@/utils/project";
import { StringUtils } from "@/utils/string";
import { Assets } from "@/utils/assets";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "botinformation",
            description: "Sends bot's information",
            aliases: ["botinfo", "statistics", "stats"],
            category: "misc",
            args: [],
        },
        async () => {
            const embed = new MessageEmbed();

            embed.setTitle(`${Emojis.INFO} | Information`);

            const sha = await Project.getSHA();
            embed.addField(
                `${Emojis.BOT} Bot`,
                [
                    `**Tag**: ${app.bot.user?.tag} (\`${Project.codeName}\`)`,
                    `**ID**: ${app.bot.user?.id}`,
                    `**Author**: ${Project.author}`,
                    `**Source Code**: [GitHub](${Project.github})`,
                    `**Commit**: ${sha ? `\`${sha}\`` : "Unknown"}`,
                ].join("\n")
            );

            embed.addField(
                `${Emojis.SYSTEM} System`,
                [
                    `**Uptime**: ${Duration.humanize(
                        Duration.parseMs(Date.now() - app.createdAt)
                    )}`,
                    `**Platform**: ${StringUtils.capitalize(os.platform())}`,
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
            embed.setImage(Assets.animeBlush);

            return { embeds: [embed] };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
