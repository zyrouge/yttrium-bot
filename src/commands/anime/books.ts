import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis, Constants, Colors } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "animegirlsholdingprogrammingbooks",
            description: "Sends an waifu holding programming books",
            aliases: ["aghpb"],
            category: "anime",
            args: [],
        },
        async ({ msg }) => {
            try {
                msg.react(Emojis.TIMER).catch(() => {});
                const random = app.plugins.animegirlsbooks.random();

                const embed = new MessageEmbed();
                embed.setTitle(
                    `${Emojis.HEART} | Waifu holding porgramming books!`
                );
                embed.setImage(random);
                embed.setColor(Colors.PURPLE);
                embed.setTimestamp();
                embed.setFooter(
                    `Source: ${Constants.urls.animeGirlsHoldingProgrammingBooks.base}`
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
