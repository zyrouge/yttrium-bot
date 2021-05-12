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
            args: [
                {
                    name: "terms",
                    alias: "t",
                    type: String,
                    multiple: true,
                    defaultOption: true,
                    helpDesc: "Song track name or url",
                    helpVal: "song",
                    optional: false,
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

            if (!args.terms) {
                return {
                    content: `${Emojis.DANGER} | Provide some search terms to fetch results!`,
                };
            }

            msg.react(Emojis.SEARCH).catch(() => {});
            app.plugins.music.play(msg, args.terms.join(" "), true);
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
