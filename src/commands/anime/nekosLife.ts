import axios from "axios";
import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { kawaiiFaces } from "@/utils/emoticons";
import { ArrayUtils } from "@/utils/array";
import { Emojis } from "@/utils/emojis";
import { Colors } from "@/utils/colors";
import { Http } from "@/utils/http";

const nekosLife = {
    baka: "https://nekos.life/api/v2/img/baka",
    cuddle: "https://nekos.life/api/v2/img/cuddle",
    feed: "https://nekos.life/api/v2/img/feed",
    hug: "https://nekos.life/api/v2/img/hug",
    kiss: "https://nekos.life/api/v2/img/kiss",
    pat: "https://nekos.life/api/v2/img/pat",
    poke: "https://nekos.life/api/v2/img/poke",
    smug: "https://nekos.life/api/v2/img/smug",
    tickle: "https://nekos.life/api/v2/img/tickle",
    slap: "https://nekos.life/api/v2/img/slap",
};

const fn: AppFile = (app) => {
    const responses: Record<
        keyof typeof nekosLife,
        (u1: string, ...un: string[]) => string
    > = {
        baka: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} Baka ${un.join(", ")}!`,
        cuddle: (u1: string, ...un: string[]) =>
            `${un.join(", ")} cuddles ${un.join(", ")}!`,
        feed: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} feeds ${un.join(", ")}!`,
        hug: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} hugs ${un.join(", ")}!`,
        kiss: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} kisses ${un.join(", ")}!`,
        pat: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} pats ${un.join(", ")}!`,
        poke: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} pokes ${un.join(", ")}!`,
        smug: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} smugs at ${un.join(
                ", "
            )}!`,
        tickle: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} tickes ${un.join(", ")}!`,
        slap: (u1: string, ...un: string[]) =>
            `${ArrayUtils.random(kawaiiFaces)} ${u1} slaps ${un.join(", ")}!`,
    };

    Object.entries(nekosLife).forEach(([key, url]) => {
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
                        url: string;
                    }>(url, {
                        responseType: "json",
                    });

                    const embed = new MessageEmbed();
                    const response = responses[key as keyof typeof nekosLife];
                    embed.setDescription(
                        response(
                            `<@${msg.author.id}>`,
                            args.user || "**nobody**"
                        )
                    );
                    embed.setImage(data.url);
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
