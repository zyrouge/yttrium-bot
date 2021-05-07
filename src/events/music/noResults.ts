import { Message } from "discord.js";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.music.on("noResults", (msg: Message, query: string) => {
        msg.channel.send(
            `${Emojis.SAD} | Now results were found for **${query}**!`
        );
    });
};

export default fn;
