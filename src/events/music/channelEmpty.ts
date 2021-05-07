import { Message } from "discord.js";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.music.on("channelEmpty", (msg: Message) => {
        const cacheKey = `music_msg_${msg.guild!.id}`;
        const pmsgurl: string = app.cacheData.get(cacheKey);
        const pmsg = msg.channel.messages.cache.get(pmsgurl);
        if (pmsg) {
            try {
                if (pmsg.deletable) pmsg.delete().catch(() => {});
            } catch (err) {}
        }

        msg.channel.send(
            `${Emojis.SAD} | Music stopped due to lack of listeners!`
        );
    });
};

export default fn;
