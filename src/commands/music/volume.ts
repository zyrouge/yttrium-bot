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

            if (args.length) {
                const vol =
                    args[0] && !isNaN(args[0] as any) ? +args[0] : false;

                if (typeof vol !== "number" || vol < 0 || vol > 100)
                    return msg.channel.send(
                        `${Emojis.DANGER} | Invalid volume was provided. Volume must be between 1 and 100!`
                    );

                app.music.setVolume(msg, vol);
            }

            msg.channel.send(`${Emojis.MUSIC} | Volume: \`${queue.volume}%\``);
        }
    );

    app.commands.add(command);
};

export default fn;
