import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "resume",
            description: "Resumes the current queue",
            aliases: ["res"],
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

            if (app.music.resume(msg)) msg.react(Emojis.PLAY).catch(() => {});
        }
    );

    app.commands.add(command);
};

export default fn;
