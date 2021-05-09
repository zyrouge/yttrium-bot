import { AppFile } from "@/base/app";
import { createCommand } from "@/base/plugins/commands";
import { Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const command = createCommand(
        {
            name: "loop",
            description: "Enables/Disables looping",
            aliases: ["lp", "repeat", "re"],
            category: "music",
        },
        async ({ msg, args }) => {
            if (!msg.member.voice.channel)
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in a Voice Channel to use this command!`
                );

            if (
                msg.guild.me?.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            )
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in the same Voice Channel to use this command!`
                );

            const queue = app.music.get(msg.guild.id);
            if (!queue)
                return msg.channel.send(
                    `${Emojis.DANGER} | Nothing is being played right now!`
                );

            const options = ["track", "queue", "none"];
            if (args[0]) {
                if (!options.includes(args[0]))
                    return msg.channel.send(
                        `${
                            Emojis.DANGER
                        } | Invalid option! Available options: ${options
                            .map((x) => `\`${x}\``)
                            .join(", ")}`
                    );

                switch (args[0]) {
                    case "track":
                    case "song":
                    case "this":
                        queue.setLoop("track");
                        break;

                    case "all":
                    case "queue":
                    case "list":
                        queue.setLoop("queue");
                        break;

                    case "none":
                    case "disable":
                    case "off":
                        queue.setLoop("none");
                        break;
                }
            }

            msg.channel.send(
                `${Emojis.MUSIC} | Currently Looping: **${Functions.capitalize(
                    queue.loop
                )}**!`
            );
        }
    );

    app.commands.add(command);
};

export default fn;
