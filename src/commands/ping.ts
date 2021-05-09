import { AppFile } from "@/base/app";
import { createCommand } from "@/base/plugins/commands";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = createCommand(
        {
            name: "ping",
            description: "Sends bot's response time",
            aliases: ["pong"],
            category: "misc",
        },
        async ({ msg }) => {
            const start = Date.now();
            const nmsg = await msg.channel.send(`${Emojis.TIMER} | Pinging...`);
            nmsg.edit(
                `${Emojis.PING_PONG} | Pong! It took ${
                    nmsg.createdAt.valueOf() - msg.createdAt.valueOf()
                }ms to respond and ${Date.now() - start}ms to process!`
            );
        }
    );

    app.commands.add(command);
};

export default fn;
