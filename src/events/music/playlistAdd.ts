import { Message } from "discord.js";
import { Queue } from "discord-player";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on(
        "playlistAdd",
        (msg: Message, queue: Queue, playlist: any) => {
            msg.channel.send(
                `${Emojis.MUSIC} | **${playlist.title}** with **${playlist.tracks.length}** tracks has been added to the queue!`
            );
        }
    );
};

export default fn;
