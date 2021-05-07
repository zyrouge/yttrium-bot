import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "play",
            description: "Plays/Adds a song to the queue",
            aliases: ["pl"],
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

            if (!args.length)
                return msg.channel.send(
                    `${Emojis.DANGER} | Provide some search terms to fetch results!`
                );

            msg.react(Emojis.SEARCH).catch(() => {});
            app.music.play(msg, args.join(" "), true);
        }
    );

    app.commands.add(command);
};

export default fn;
