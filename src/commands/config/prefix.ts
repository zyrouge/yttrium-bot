import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Database } from "@/base/database/Mongoose";
import { Emojis } from "@/utils/emojis";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "prefix",
            description: "Sets/sends the bot's prefix",
            aliases: ["pre"],
            category: "config",
            args: [
                {
                    name: "prefix",
                    alias: "p",
                    type: String,
                    defaultOption: true,
                    helpDesc: "New prefix",
                    optional: true,
                },
            ],
        },
        async ({ msg, args }) => {
            const newPrefix = (<string | undefined>args.prefix)?.trim();
            if (msg.guild && newPrefix) {
                if (newPrefix.length > 3) {
                    return {
                        content: `${Emojis.DANGER} | Prefix cannot be more than 3 characters!`,
                    };
                }

                try {
                    await Database.models.guild.set(msg.guild.id, {
                        prefix: newPrefix,
                    });
                } catch (err) {
                    return {
                        content: `${Emojis.SAD} | Somethign went wrong! (${err})`,
                    };
                }
            }

            const currentPrefix =
                (msg.guild &&
                    (await Database.models.guild.get(msg.guild.id))?.prefix) ||
                process.env.PREFIX;
            return {
                content: `${Emojis.BOT} | My prefix is \`${currentPrefix}\`!`,
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
