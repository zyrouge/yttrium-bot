import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const options = ["track", "queue", "none"];

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "loop",
            description: "Enables/Disables looping",
            aliases: ["lp", "repeat", "re"],
            category: "music",
            args: [
                {
                    name: "loop",
                    alias: "l",
                    type: String,
                    defaultOption: true,
                    helpDesc: "Type of loop",
                    helpVal: options,
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

            if (args.loop) {
                const loop = args.loop;
                if (!options.includes(loop)) {
                    return {
                        content: `${
                            Emojis.DANGER
                        } | Invalid option! Available options: ${options
                            .map((x) => `\`${x}\``)
                            .join(", ")}`,
                    };
                }
                switch (loop) {
                    case "track":
                        player.queueRepeat && player.setQueueRepeat(false);
                        player.setTrackRepeat(true);
                        break;

                    case "queue":
                        player.trackRepeat && player.setTrackRepeat(false);
                        player.setQueueRepeat(true);
                        break;

                    case "none":
                        player.queueRepeat && player.setQueueRepeat(false);
                        player.trackRepeat && player.setTrackRepeat(false);
                        break;
                }
            }
            return {
                content: `${Emojis.MUSIC} | Currently Looping: **${
                    player.trackRepeat
                        ? "track"
                        : player.queueRepeat
                        ? "queue"
                        : "none"
                }**!`,
            };
        }
    );
    app.plugins.commands.add(command);
};

export default fn;
