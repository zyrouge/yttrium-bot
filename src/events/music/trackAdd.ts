import { Message } from "discord.js";
import { Track, Queue } from "discord-player";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.music.on("trackAdd", (msg: Message, queue: Queue, track: Track) => {
        msg.channel.send(
            `${Emojis.MUSIC} | **${track.title}** has been added to the queue!`
        );
    });
};

export default fn;
