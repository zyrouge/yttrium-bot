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
            args: [],
        },
        async ({ msg, args }) => {
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

            const embed = new MessageEmbed();

            embed.setTitle(`${Emojis.MUSIC} | Current queue`);
            embed.setTimestamp();
            embed.setColor(Colors.BLUE);

            const page = args[0] && !isNaN(args[0] as any) ? +args[0] - 1 : 0;
            if (page < 0)
                return msg.reply(`${Emojis.DANGER} | Invalid page number!`);

            const perpage = 5;
            const start = page * perpage;
            const songs = queue.tracks.slice(start, start + perpage);
            if (!songs.length)
                return msg.reply(
                    `${Emojis.SAD} | No songs were found on **page ${page}**!`
                );

            const np = app.music.nowPlaying(msg);
            if (np)
                if (np)
                    embed.addField(
                        `${Emojis.SOUND} Now playing`,
                        `**[${np.title}](${np.url})** [${np.duration}] (<@${np.requestedBy.id}>)`
                    );

            embed.setDescription(
                songs
                    .map(
                        (x, i) =>
                            `${i + 1 + start}. **[${x.title}](${x.url})** [${
                                x.duration
                            }] (<@${x.requestedBy.id}>)`
                    )
                    .join("\n") + (np ? "\n\n** **" : "")
            );

            embed.setFooter(
                `Page: ${page + 1}/${Math.ceil(
                    queue.tracks.length / perpage
                )} | Total tracks: ${queue.tracks.length}`
            );

            msg.reply({ embed });
        }
    );

    app.commands.add(command);
};

export default fn;
