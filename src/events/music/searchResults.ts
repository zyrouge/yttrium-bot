import { Message, MessageEmbed } from "discord.js";
import { Track } from "discord-player";
import { AppFile } from "@/base/app";
import { Colors, Emojis } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on(
        "searchResults",
        (msg: Message, query: string, tracks: Track[]) => {
            const embed = new MessageEmbed();

            embed.setTitle(
                `${Emojis.MUSIC} | Here are your search results for ${query}`
            );
            embed.setDescription(
                tracks
                    .map(
                        (t, i) =>
                            `${i + 1}. **[${t.title}](${t.url})** [${
                                t.duration
                            }]`
                    )
                    .join("\n")
            );
            embed.setTimestamp();
            embed.setColor(Colors.BLUE);

            msg.channel.send({ embed });
        }
    );
};

export default fn;
