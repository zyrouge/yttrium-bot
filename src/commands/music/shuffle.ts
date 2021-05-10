import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "shuffle",
            description: "Shuffles the queue",
            aliases: ["sh"],
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

            app.music.shuffle(msg);
            msg.reply(`${Emojis.MUSIC} | Shuffled the queue!`);
        }
    );

    app.commands.add(command);
};

export default fn;
