import { Message } from "discord.js";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on("searchCancel", (msg: Message) => {
        msg.channel.send(
            `${Emojis.DANGER} | Timed out! No response was provided was in time.`
        );
    });
};

export default fn;
