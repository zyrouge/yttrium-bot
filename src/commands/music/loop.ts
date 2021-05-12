import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

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
                    helpVal: ["track", "queue", "none"],
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

            const options = ["track", "queue", "none"];
            if (args.loop) {
                const loop = args.join(" ");
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
                    case "song":
                    case "this":
                        queue.loopMode &&
                            app.plugins.music.setLoopMode(msg, false);
                        app.plugins.music.setRepeatMode(msg, true);
                        break;

                    case "all":
                    case "queue":
                    case "list":
                        queue.repeatMode &&
                            app.plugins.music.setRepeatMode(msg, false);
                        app.plugins.music.setLoopMode(msg, true);
                        break;

                    case "none":
                    case "disable":
                    case "off":
                        queue.loopMode &&
                            app.plugins.music.setLoopMode(msg, false);
                        queue.repeatMode &&
                            app.plugins.music.setRepeatMode(msg, false);
                        break;
                }
            }

            return {
                content: `${Emojis.MUSIC} | Currently Looping: **${
                    queue.repeatMode
                        ? "track"
                        : queue.loopMode
                        ? "queue"
                        : "none"
                }**!`,
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
