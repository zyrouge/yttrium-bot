import { MessageEmbed, TextChannel } from "discord.js";
import { AppFile } from "@/base/app";
import { Colors, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on("trackStart", async (player, track) => {
        const channel = <TextChannel>(
            app.bot.channels.cache.get(<`${bigint}`>player.textChannel)
        );
        const cacheKey = `music_msg_${channel!.guild.id}`;

        const pmsgurl: string = app.plugins.cacheData.get(cacheKey);
        const pmsg = channel.messages.cache.get(<`${bigint}`>pmsgurl);
        if (pmsg) {
            try {
                if (pmsg.deletable) pmsg.delete().catch(() => {});
            } catch (err) {}
        }

        const embed = new MessageEmbed()
            .setTitle(`${Emojis.MUSIC} | Now playing`)
            .setDescription(
                [
                    `**Title**: [${track.title}](${track.uri})`,
                    `**Requested by**: <@${track.requester}>`,
                    `**Duration:** ${Functions.humanizeDuration(
                        Functions.parseMs(track.duration)
                    )}`,
                ].join("\n")
            )
            .setColor(Colors.BLUE);

        const nmsg = await channel.send({ embed });
        app.plugins.cacheData.set(cacheKey, nmsg.id);
    });
};

export default fn;
