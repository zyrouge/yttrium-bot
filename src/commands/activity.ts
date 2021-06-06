import axios from "axios";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const Activities: Record<
    string,
    {
        id: `${bigint}`;
        name: string;
    }
> = {
    poker: {
        id: "755827207812677713",
        name: "Poker Night",
    },
    betrayal: {
        id: "773336526917861400",
        name: "Betrayal.io",
    },
    youtube: {
        id: "755600276941176913",
        name: "YouTube Together",
    },
    fishington: {
        id: "814288819477020702",
        name: "Fishington.io",
    },
};
const options = Object.keys(Activities);

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "activity",
            description: "Discord Activities",
            aliases: ["act"],
            category: "fun",
            args: [
                {
                    name: "activity",
                    alias: "a",
                    type: String,
                    defaultOption: true,
                    multiple: false,
                    helpDesc: "Activity name",
                    helpVal: options,
                    optional: false,
                },
                {
                    name: "channel",
                    alias: "c",
                    type: String,
                    multiple: false,
                    helpDesc: "Voice channel",
                    optional: true,
                },
            ],
        },
        async ({ msg, args }) => {
            try {
                const voiceChannel =
                    msg.mentions.channels.first() ||
                    msg.guild?.channels.cache.get(args.channel) ||
                    msg.member!.voice.channel;
                if (!voiceChannel) {
                    return {
                        content: `${Emojis.DANGER} | You must be in a Voice Channel or mention a Voice Channel to start an activity!`,
                    };
                }
                if (voiceChannel.type !== "voice") {
                    return {
                        content: `${Emojis.DANGER} | <#${voiceChannel.id}> is not an valid Voice Channel!`,
                    };
                }

                const activity =
                    Activities[args.activity?.trim()?.toLowerCase()];
                if (!activity) {
                    return {
                        content: `${
                            Emojis.DANGER
                        } | Invalid activity was provided! Available activities: ${options
                            .map((x) => `\`${x}\``)
                            .join(", ")}.`,
                    };
                }

                const { data } = await axios.post(
                    `https://discord.com/api/v8/channels/${voiceChannel.id}/invites`,
                    {
                        target_application_id: activity.id,
                        target_type: 2,
                    },
                    {
                        headers: {
                            Authorization: `Bot ${app.bot.token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                return {
                    content: `${Emojis.SUCCESS} | Started **${data.target_application.name}** in <#${data.channel.id}>!\n${Emojis.INFO} | Invite URL: https://discord.gg/${data.code}`,
                };
            } catch (err) {
                return {
                    content: `${Emojis.SAD} | Something went wrong! (${err})`,
                };
            }
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
