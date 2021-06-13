import { TextChannel } from "discord.js";
import { AppFile } from "@/base/app";

const fn: AppFile = (app) => {
    app.plugins.music.on("trackEnd", async (player) => {
        const channel = <TextChannel>(
            app.bot.channels.cache.get(<`${bigint}`>player.textChannel)
        );

        const pmsg =
            player.lastMessageID &&
            channel.messages.cache.get(<`${bigint}`>player.lastMessageID);
        if (pmsg) {
            try {
                if (pmsg.deletable) pmsg.delete().catch(() => {});
            } catch (err) {}
        }
    });
};

export default fn;
