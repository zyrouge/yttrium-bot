import Discord from "discord.js";
import { AppFile } from "@/base/app";
import { CommandMessage } from "@/base/plugins/commands";
import { Constants } from "@/util";

const fn: AppFile = (app) => {
    app.bot.on("message", (msg: Discord.Message) => {
        if (msg.author.bot || !msg.guild || !app.bot.user) return;

        let prefix: string | undefined, content: string | undefined;

        if (process.env.PREFIX && msg.content.startsWith(process.env.PREFIX)) {
            prefix = process.env.PREFIX;
            content = msg.content.slice(prefix.length);
        }

        const mentionPrefix = Constants.regex.discordMention(app.bot.user.id);
        if (app.bot.user && mentionPrefix.test(msg.content)) {
            prefix = `@${app.bot.user.username} `;
            content = msg.content.replace(mentionPrefix, "").trim();
        }

        if (!prefix || !content) return;
        const [cmdName, ...args] = content.split(" ");

        const command = app.commands.resolve(cmdName);
        if (!command) return;

        command.run({
            msg: msg as CommandMessage,
            prefix,
            args,
        });
    });
};

export default fn;
