import Discord from "discord.js";
import { AppFile } from "@/base/app";
import { Constants, Emojis } from "@/util";
import {
    ArgsParser,
    ArgsParserReturn,
    ArgsErrorFormatter,
} from "@/base/plugins/commands";

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
        const [cmdName, ...contents] = content.split(" ");

        const command = app.commands.resolve(cmdName);
        if (!command) return;

        let args: ArgsParserReturn;
        try {
            args = ArgsParser(contents, command.args);
        } catch (err) {
            return msg.reply(`${Emojis.DANGER} | ${ArgsErrorFormatter(err)}`);
        }

        try {
            command.run({
                msg,
                prefix,
                contents,
                args,
            });
        } catch (err) {
            return msg.reply(
                `${Emojis.DANGER} | Something went wrong while running the command! (${err})`
            );
        }
    });
};

export default fn;
