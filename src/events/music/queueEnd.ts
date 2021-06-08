import { TextChannel } from "discord.js";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on("queueEnd", async (player) => {
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

        player.disconnect();
        player.destroy();
        channel.send(`${Emojis.MUSIC} | Queue has ended.`);
    });
};

export default fn;
