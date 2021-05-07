import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "clearqueue",
            description: "Clears the current queue",
            aliases: ["cq", "cqueue", "emptyqueue"],
            category: "music",
        },
        async ({ msg }) => {
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

            if (queue.tracks.length <= 1)
                return msg.channel.send(
                    `${Emojis.DANGER} | Cannot clear the queue due to lack of tracks!`
                );

            app.music.clearQueue(msg);

            msg.channel.send(`${Emojis.SUCCESS} | Cleared the queue!`);
        }
    );

    app.commands.add(command);
};

export default fn;
