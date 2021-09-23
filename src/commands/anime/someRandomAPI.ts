import axios from "axios";
import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { ArrayUtils } from "@/utils/array";
import { kawaiiFaces } from "@/utils/emoticons";
import { Http } from "@/utils/http";
import { Colors } from "@/utils/colors";
import { Emojis } from "@/utils/emojis";

const someRandomAPI = {
    wink: "https://some-random-api.ml/animu/wink",
};

const fn: AppFile = (app) => {
    const responses: Record<
        keyof typeof someRandomAPI,
        (u1: string, ...un: string[]) => string
    > = {
        wink: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} winks at ${un.join(
                ", "
            )}!`,
    };

    Object.entries(someRandomAPI).forEach(([key, url]) => {
        const command = new Command(
            {
                name: key,
                description: `${ArrayUtils.random(kawaiiFaces)} Anime reaction`,
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
                        responses[key as keyof typeof someRandomAPI];
                    embed.setDescription(
                        response(
                            `<@${msg.author.id}>`,
                            args.user || "**nobody**"
                        )
                    );
                    embed.setImage(data.link);
                    embed.setColor(Colors.PINK);
                    embed.setTimestamp();
                    embed.setFooter(`Source: ${Http.parseHost(url)}`);

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
