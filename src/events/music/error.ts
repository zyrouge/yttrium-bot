import { Message } from "discord.js";
import { AppFile } from "@/base/app";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on("error", (err: any, msg: Message, ...args: any[]) => {
        switch (err) {
            case "NotPlaying":
                msg.channel.send(
                    `${Emojis.SAD} | Nothing is being played on this server right now!`
                );
                break;

            case "NotConnected":
                msg.channel.send(
                    `${Emojis.DANGER} | You are not connected in any Voice Channel!`
                );
                break;

            case "UnableToJoin":
                msg.channel.send(
                    `${Emojis.SAD} | I am not able to join your Voice Channel, please check my permissions!`
                );
                break;

            case "VideoUnavailable":
                msg.channel.send(
                    `${Emojis.DANGER} | **${args[0].title}** is not available in your country! Skipping...`
                );
                break;

            case "MusicStarting":
                msg.channel.send(
                    `${Emojis.TIMER} | The music is starting... please wait and retry!`
                );
                break;

            default:
                msg.channel.send(
                    `${Emojis.SAD} | Something went wrong! (${err})`
                );
        }
    });
};

export default fn;
