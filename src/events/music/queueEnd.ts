import { TextChannel } from "discord.js";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on("queueEnd", async (player) => {
        const channel = <TextChannel>(
            app.bot.channels.cache.get(<`${bigint}`>player.textChannel)
        );

        player.disconnect();
        player.destroy();
        channel.send(`${Emojis.MUSIC} | Queue has ended.`);
    });
};

export default fn;
