import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "volume",
            description: "Shows/Sets the queue volume of the queue",
            aliases: ["vol"],
            category: "music",
            args: [
                {
                    name: "volume",
                    alias: "v",
                    type: Number,
                    defaultOption: true,
                    defaultValue: null,
                    helpDesc: "Volume to be set",
                    helpVal: "1-100",
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

            const player = app.plugins.music.get(msg.guild!.id);
            if (!player) {
                return {
                    content: `${Emojis.DANGER} | Nothing is being played right now!`,
                };
            }

            if ("volume" in args) {
                const vol =
                    typeof args.volume === "number" && !isNaN(args.volume)
                        ? args.volume
                        : -1;
                if (vol < 0 || vol > 100) {
                    return {
                        content: `${Emojis.DANGER} | Invalid volume was provided. Volume must be between 1 and 100!`,
                    };
                }

                player.setVolume(vol);
            }

            return {
                content: `${Emojis.MUSIC} | Volume: \`${player.volume}%\``,
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
