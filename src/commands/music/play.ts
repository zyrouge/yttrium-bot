import { AppFile } from "@/base/app";
import { createCommand } from "@/base/plugins/commands";
import { GuildAudioManager } from "@/base/plugins/music/queue";
import { Track } from "@/base/plugins/music/track";
import { Emojis } from "@/util";

import {
    parse as YouTubeInfo,
    validate as YouTubeValidate,
} from "@/base/plugins/music/extractors/YouTubeVideo";
import {
    parse as HttpInfo,
    validate as HttpValidate,
} from "@/base/plugins/music/extractors/HttpStreams";

const fn: AppFile = (app) => {
    const command = createCommand(
        {
            name: "play",
            description: "Plays/Adds a song to the queue",
            aliases: ["pl"],
            category: "music",
        },
        async ({ msg, args }) => {
            if (!msg.member.voice.channel)
                return msg.channel.send(
                    `${Emojis.DANGER} | You must be in a Voice Channel to use this command!`
                );

            if (
                msg.guild.me?.voice.channel &&
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

            const term = args.join(" ");
            let track: Omit<Track, "requester"> | undefined;

            if (YouTubeValidate(term)) track = await YouTubeInfo(term);
            if (HttpValidate(term)) track = HttpInfo(term);

            if (!track)
                return msg.channel.send(
                    `${Emojis.SAD} | Could not find results for ${term}`
                );

            let playFromStart = false;
            let queue = app.music.get(msg.guild.id);
            if (!queue) {
                queue = new GuildAudioManager(
                    msg.channel,
                    msg.member.voice.channel
                );
                app.music.set(msg.guild.id, queue);
            }

            queue.addTrack(
                Object.assign(track, {
                    requester: msg.author.id,
                })
            );

            msg.channel.send(
                `${Emojis.MUSIC} | **${track.title}** has been added to the queue!`
            );

            if (!queue.playing) await queue.start(playFromStart);
        }
    );

    app.commands.add(command);
};

export default fn;
