import { Message, Collector } from "discord.js";
import { Track } from "discord-player";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on(
        "searchInvalidResponse",
        (
            msg: Message,
            query: string,
            tracks: Track[],
            content: string,
            collector: Collector<any, any>
        ) => {
            if (content === "cancel") {
                collector.stop();
                return msg.channel.send(
                    `${Emojis.MUSIC} | The search selection has been **cancelled**!`
                );
            }

            msg.channel.send(
                `${Emojis.DANGER} | You must send a valid number between **1** and **${tracks.length}**!`
            );
        }
    );
};

export default fn;
