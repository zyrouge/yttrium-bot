import axios from "axios";
import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Constants, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const responses: Record<
        keyof typeof Constants.urls.someRandomAPI,
        (u1: string, ...un: string[]) => string
    > = {
        wink: (u1: string, ...un: string[]) =>
            `${Functions.random(
                Constants.kawaiiFaces
            )} ${u1} winks at ${un.join(", ")}!`,
    };

    Object.entries(Constants.urls.someRandomAPI).forEach(([key, url]) => {
        const command = new Command(
            {
                name: key,
                description: `${Functions.random(
                    Constants.kawaiiFaces
                )} Anime reaction`,
                aliases: [],
                category: "anime",
                args: [
                    {
                        name: "user",
                        alias: "u",
                        type: String,
                        multiple: true,
                        defaultOption: true,
                        helpDesc: "A lovable user",
                        helpVal: "@mention",
                        optional: true,
                    },
                ],
            },
            async ({ msg, args }) => {
                try {
                    msg.react(Emojis.WHITE_FLOWER).catch(() => {});
                    const { data } = await axios.get<{
                        link: string;
                    }>(url, {
                        responseType: "json",
                    });

                    const embed = new MessageEmbed();
                    const response =
                        responses[
                            key as keyof typeof Constants.urls.someRandomAPI
                        ];
                    embed.setDescription(
                        response(
                            `<@${msg.author.id}>`,
                            args.user || "**nobody**"
                        )
                    );
                    embed.setImage(data.link);
                    embed.setColor(Colors.PINK);
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
    });
};

export default fn;
