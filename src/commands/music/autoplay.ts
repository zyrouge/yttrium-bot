import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "autoplay",
            description: "Enables/Disables autoplay",
            aliases: ["ap"],
            category: "music",
            args: [
                {
                    name: "autoplay",
                    alias: "a",
                    type: String,
                    defaultOption: true,
                    helpDesc: "Enable/disable autoplay",
                    helpVal: ["enable", "disable"],
                    optional: true,
                },
            ],
        },
        async ({ msg, args }) => {
            if (!msg.member?.voice.channel) {
                return {
                    content: `${Emojis.DANGER} | You must be in a Voice Channel to use this command!`,
                };
            }

            if (
                msg.guild?.me?.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                return {
                    content: `${Emojis.DANGER} | You must be in the same Voice Channel to use this command!`,
                };
            }

            const queue = app.plugins.music.getQueue(msg);
            if (!queue) {
                return {
                    content: `${Emojis.DANGER} | Nothing is being played right now!`,
                };
            }

            const options = ["enable", "disable"];
            if (args.autoplay) {
                const autoplay = args.autoplay.toLowerCase();
                if (!options.includes(autoplay)) {
                    return {
                        content: `${
                            Emojis.DANGER
                        } | Invalid option! Available options: ${options
                            .map((x) => `\`${x}\``)
                            .join(", ")}`,
                    };
                }

                app.plugins.music.setAutoPlay(msg, autoplay === "enable");
            }

            return {
                content: `${Emojis.MUSIC} | Autoplay: **${
                    queue.autoPlay ? "Enabled" : "Disabled"
                }**!`,
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
