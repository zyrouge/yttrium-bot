import { AppFile } from "@/base/app";
import Discord from "discord.js";

const fn: AppFile = (app) => {
    app.bot.on("message", (msg: Discord.Message) => {
        if (msg.author.bot || !msg.guild) return;
        
        const prefix = process.env.PREFIX;
        if (!prefix || !msg.content.startsWith(prefix)) return;

        const content = msg.content.slice(prefix.length);
        const [cmdName, ...args] = content.split(" ");

        const command = app.commands.resolve(cmdName);
        if (!command) return;
    
        command.run({
            msg,
            prefix,
            args
        });
    });
}

export default fn;