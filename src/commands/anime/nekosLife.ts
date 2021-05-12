import axios from "axios";
import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Constants, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const responses: Record<
        keyof typeof Constants.urls.nekosLife,
        (u1: string, ...un: string[]) => string
    > = {
        baka: (u1: string, ...un: string[]) =>
            `${Functions.random(Constants.kawaiiFaces)} Baka ${un.join(", ")}!`,
        cuddle: (u1: string, ...un: string[]) =>
            `${un.join(", ")} cuddles ${un.join(", ")}!`,
        feed: (u1: string, ...un: string[]) =>
            `${Functions.random(Constants.kawaiiFaces)} ${u1} feeds ${un.join(
                ", "
            )}!`,
        hug: (u1: string, ...un: string[]) =>
            `${Functions.random(Constants.kawaiiFaces)} ${u1} hugs ${un.join(
                ", "
            )}!`,
        kiss: (u1: string, ...un: string[]) =>
            `${Functions.random(Constants.kawaiiFaces)} ${u1} kisses ${un.join(
                ", "
            )}!`,
        pat: (u1: string, ...un: string[]) =>
            `${Functions.random(Constants.kawaiiFaces)} ${u1} pats ${un.join(
                ", "
            )}!`,
        poke: (u1: string, ...un: string[]) =>
            `${Functions.random(Constants.kawaiiFaces)} ${u1} pokes ${un.join(
                ", "
            )}!`,
        smug: (u1: string, ...un: string[]) =>
            `${Functions.random(
                Constants.kawaiiFaces
            )} ${u1} smugs at ${un.join(", ")}!`,
        tickle: (u1: string, ...un: string[]) =>
            `${Functions.random(Constants.kawaiiFaces)} ${u1} tickes ${un.join(
                ", "
            )}!`,
        slap: (u1: string, ...un: string[]) =>
            `${Functions.random(Constants.kawaiiFaces)} ${u1} slaps ${un.join(
                ", "
            )}!`,
    };

    Object.entries(Constants.urls.nekosLife).forEach(([key, url]) => {
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
                        url: string;
                    }>(url, {
                        responseType: "json",
                    });

                    const embed = new MessageEmbed();
                    const response =
                        responses[key as keyof typeof Constants.urls.nekosLife];
                    embed.setDescription(
                        response(
                            `<@${msg.author.id}>`,
                            args.user || "**nobody**"
                        )
                    );
                    embed.setImage(data.url);
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
