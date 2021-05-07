import { MessageEmbed } from "discord.js";
import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "queue",
            description: "Shows the current queue",
            aliases: ["q", "songs", "list"],
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

            const embed = new MessageEmbed();

            embed.setTitle(`${Emojis.MUSIC} | Current queue`);
            embed.setTimestamp();
            embed.setColor(Colors.BLUE);

            const page = args[0] && !isNaN(args[0] as any) ? +args[0] - 1 : 0;
            if (page < 0)
                return msg.channel.send(
                    `${Emojis.DANGER} | Invalid page number!`
                );

            const perpage = 5;
            const start = page * perpage;
            const songs = queue.tracks.slice(start, start + perpage);
            if (!songs.length)
                return msg.channel.send(
                    `${Emojis.SAD} | No songs were found on **page ${page}**!`
                );

            embed.setDescription(
                songs.map(
                    (x, i) =>
                        `${i + 1 + start}. **${x.title}** [${x.duration}] (<@${
                            x.requestedBy.id
                        }>)`
                )
            );

            const np = app.music.nowPlaying(msg);
            if (np)
                embed.addField(
                    `${Emojis.PLAY} | Now playing`,
                    `**${np.title}** [${np.duration}] (<@${np.requestedBy.id}>)`
                );

            embed.setFooter(
                `Page: ${page + 1}/${Math.ceil(
                    queue.tracks.length / perpage
                )} | Total tracks: ${queue.tracks.length}`
            );

            msg.channel.send({ embed });
        }
    );

    app.commands.add(command);
};

export default fn;
