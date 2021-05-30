import Discord from "discord.js";
import { AppFile } from "@/base/app";
import { Constants, Emojis } from "@/util";
import {
    ArgsParser,
    ArgsParserReturn,
    ArgsErrorFormatter,
    getCommandHelpEmbed,
} from "@/base/plugins/commands";

const fn: AppFile = (app) => {
    app.bot.on("message", async (msg: Discord.Message) => {
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

        const command = app.plugins.commands.resolve(cmdName.toLowerCase());
        if (!command) return;

        if (contents.includes("--help")) {
            const help = getCommandHelpEmbed(prefix, command);
            msg.reply({ embed: help });
            return;
        }

        let args: ArgsParserReturn;
        try {
            args = ArgsParser(contents, command.args);
        } catch (err) {
            msg.reply(`${Emojis.DANGER} | ${ArgsErrorFormatter(err)}`);
            return;
        }

        try {
            const res = await command.run({
                msg,
                prefix,
                contents,
                args,
            });

            if (res) msg.reply(res);
        } catch (err) {
            msg.reply(
                `${Emojis.DANGER} | Something went wrong while running the command! (${err})`
            );
            return;
        }
    });
};

export default fn;
