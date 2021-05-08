import { Message, MessageEmbed } from "discord.js";
import { Track } from "discord-player";
import { AppFile } from "@/base/app";
import { Colors, Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.music.on("trackStart", async (msg: Message, track: Track) => {
        const cacheKey = `music_msg_${msg.guild!.id}`;
        const pmsgurl: string = app.cacheData.get(cacheKey);
        const pmsg = msg.channel.messages.cache.get(pmsgurl);
        if (pmsg) {
            try {
                if (pmsg.deletable) pmsg.delete().catch(() => {});
            } catch (err) {}
        }

        const embed = new MessageEmbed()
            .setTitle(`${Emojis.MUSIC} | Now playing`)
            .setDescription(
                [
                    `**Title**: [${track.title}](${track.url})`,
                    `**Requested by**: <@${track.requestedBy.id}>`,
                    `**Duration:** ${track.duration}`,
                ].join("\n")
            )
            .setThumbnail(track.thumbnail)
            .setColor(Colors.BLUE);

        const nmsg = await msg.channel.send({ embed });
        app.cacheData.set(cacheKey, nmsg.id);
    });
};

export default fn;
