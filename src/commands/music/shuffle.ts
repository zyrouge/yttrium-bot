import { AppFile } from "@/base/app";
import { createCommand } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = createCommand(
        {
            name: "shuffle",
            description: "Shuffles the queue",
            aliases: ["sh"],
            category: "music",
        },
        async ({ msg }) => {
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

            queue.shuffle();
            msg.channel.send(`${Emojis.MUSIC} | Shuffled the queue!`);
        }
    );

    app.commands.add(command);
};

export default fn;
