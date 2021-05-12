import { Message } from "discord.js";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on("queueEnd", (msg: Message) => {
        const cacheKey = `music_msg_${msg.guild!.id}`;
        const pmsgurl: string = app.plugins.cacheData.get(cacheKey);
        const pmsg = msg.channel.messages.cache.get(pmsgurl);
        if (pmsg) {
            try {
                if (pmsg.deletable) pmsg.delete().catch(() => {});
            } catch (err) {}
        }

        msg.channel.send(`${Emojis.MUSIC} | Queue has ended!`);
    });
};

export default fn;
