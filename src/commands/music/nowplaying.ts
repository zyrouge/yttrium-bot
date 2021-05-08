import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "nowplaying",
            description: "Shows the currently playing track",
            aliases: ["np", "current"],
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
            const track = app.music.nowPlaying(msg);
            if (!queue || !track)
                return msg.channel.send(
                    `${Emojis.DANGER} | Nothing is being played right now!`
                );

            const embed = new MessageEmbed();

            embed.setTitle(`${Emojis.MUSIC} | Now Playing`);
            embed.setDescription(
                [
                    `**Title**: [${track.title}](${track.url})`,
                    `**Requested by**: <@${track.requestedBy.id}>`,
                ].join("\n")
            );
            embed.addField(
                "** **",
                app.music.createProgressBar(msg, { timecodes: true })
            );
            embed.setThumbnail(track.thumbnail);
            embed.setTimestamp();
            embed.setColor(Colors.BLUE);
            embed.setFooter(
                `Looping: ${
                    queue.repeatMode
                        ? "Track"
                        : queue.loopMode
                        ? "Queue"
                        : "None"
                }`
            );

            msg.channel.send({ embed });
        }
    );

    app.commands.add(command);
};

export default fn;
