import { MessageEmbed } from "discord.js";
import axios from "axios";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis, Constants } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "animequote",
            description: "Shows top animes",
            aliases: ["aquote", "animequotes"],
            category: "anime",
            args: [],
        },
        async ({ msg }) => {
            try {
                msg.react(Emojis.TIMER).catch(() => {});
                const { data } = await axios.get<{
                    anime: string;
                    character: string;
                    quote: string;
                }>(Constants.urls.animeQuote.random, {
                    responseType: "json",
                });

                const embed = new MessageEmbed();
                embed.setTitle(
                    `${Emojis.PAPER_PENCIL} | Quote from ${data.anime}`
                );
                embed.setDescription(`**"${data.quote}"** - ${data.character}`);
                embed.setColor("RANDOM");
                embed.setTimestamp();

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
