import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "pause",
            description: "Pauses the current queue",
            aliases: ["pa"],
            category: "music",
            args: [],
        },
        async ({ msg }) => {
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
            const player = app.plugins.music.get(msg.guild!.id);
            if (!player) {
                return {
                    content: `${Emojis.DANGER} | Nothing is being played right now!`,
                };
            }
            if (!player.paused) {
                player.pause(true);
                msg.react(Emojis.PAUSE).catch(() => {});
            }
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
