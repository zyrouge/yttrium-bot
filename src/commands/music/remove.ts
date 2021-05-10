import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "remove",
            description: "Removes a song the queue",
            aliases: ["rm"],
            category: "music",
            args: [
                {
                    name: "index",
                    alias: "i",
                    type: Number,
                    defaultValue: null,
                    defaultOption: true,
                },
            ],
        },
        async ({ msg, args }) => {
            if (!msg.member?.voice.channel)
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in a Voice Channel to use this command!`
                );

            if (
                msg.guild?.me?.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            )
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in the same Voice Channel to use this command!`
                );

            const queue = app.music.getQueue(msg);
            if (!queue)
                return msg.channel.send(
                    `${Emojis.DANGER} | Nothing is being played right now!`
                );

            if (!("index" in args))
                return msg.channel.send(
                    `${Emojis.DANGER} | Provide a song index to remove!`
                );

            const index =
                typeof args.index === "number" && !isNaN(args.index)
                    ? args.index - 1
                    : -1;
            if (index < 0 || !queue.tracks[index])
                return msg.channel.send(
                    `${Emojis.DANGER} | Invalid song index was provided!`
                );

            const removed = app.music.remove(msg, index);
            msg.channel.send(
                `${Emojis.SUCCESS} | Removed **${removed.title}** from the queue!`
            );
        }
    );

    app.commands.add(command);
};

export default fn;
