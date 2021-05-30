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
                    type: Boolean,
                    helpDesc: "Enable/disable autoplay",
                    helpVal: [],
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
            let autoplay = queue.autoPlay;
            if (!queue) {
                return {
                    content: `${Emojis.DANGER} | Nothing is being played right now!`,
                };
            }

            if (args.autoplay !== null) {
                autoplay = !!args.autoplay;
                app.plugins.music.setAutoPlay(msg, autoplay);
            }

            return {
                content: `${Emojis.MUSIC} | Autoplay: **${
                    autoplay ? "Enabled" : "Disabled"
                }**!`,
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
