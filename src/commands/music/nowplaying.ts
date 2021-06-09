import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "nowplaying",
            description: "Shows the currently playing track",
            aliases: ["np", "current"],
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
            const track = player?.queue.current;
            if (!player || !track) {
                return {
                    content: `${Emojis.DANGER} | Nothing is being played right now!`,
                };
            }
            const embed = new MessageEmbed();
            embed.setTitle(`${Emojis.MUSIC} | Now Playing`);
            embed.setDescription(
                [
                    `**Title**: [${track.title}](${track.uri})`,
                    `**Requested by**: <@${track.requester}>`,
                ].join("\n")
            );

            if (track.duration) {
                const dura = (dur: number) =>
                    Functions.humanizeDuration(Functions.parseMs(dur));
                const max = 10;
                const count = Math.floor(
                    (player.position / track.duration) * max
                );
                const bar = "▬",
                    dot = "🔘";
                embed.addField(
                    "** **",
                    `${dura(player.position)} ${bar.repeat(
                        count
                    )}${dot}${bar.repeat(max - count)} ${dura(
                        track.duration
                    )} (${Math.floor(
                        (player.position / track.duration) * 100
                    )}%)`
                );
            }

            embed.setTimestamp();
            embed.setColor(Colors.BLUE);
            embed.setFooter(
                `Looping: ${
                    player.trackRepeat
                        ? "Track"
                        : player.queueRepeat
                        ? "Queue"
                        : "None"
                }`
            );

            const thumb = track.thumbnail || track.displayThumbnail?.();
            if (thumb) embed.setThumbnail(thumb);

            return { embed };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
