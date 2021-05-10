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
            args: [],
        },
        async ({ msg }) => {
            if (!msg.member?.voice.channel)
                return msg.reply(
                    `${Emojis.DANGER} | You must be in a Voice Channel to use this command!`
                );

            if (
                msg.guild?.me?.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            )
                return msg.reply(
                    `${Emojis.DANGER} | You must be in the same Voice Channel to use this command!`
                );

            const queue = app.music.getQueue(msg);
            if (!queue)
                return msg.reply(
                    `${Emojis.DANGER} | Nothing is being played right now!`
                );

            if (queue.tracks.length <= 1)
                return msg.reply(
                    `${Emojis.DANGER} | Cannot clear the queue due to lack of tracks!`
                );

            app.music.clearQueue(msg);

            msg.reply(`${Emojis.SUCCESS} | Cleared the queue!`);
        }
    );

    app.commands.add(command);
};

export default fn;
