import util from "util";
import { AppFile } from "@/base/app";
import { createCommand } from "@/base/plugins/commands";
import { Emojis, Functions } from "@/util";

if (!process.env.OWNERS) throw new Error("Missing 'process.env.OWNERS'");
const Owners: string[] = process.env.OWNERS.split(",");

const fn: AppFile = (app) => {
    const command = createCommand(
        {
            name: "eval",
            description: "Evaluates javascript code",
            aliases: ["ev"],
            category: "misc",
        },
        async ({ msg, args }) => {
            if (!Owners.includes(msg.author.id)) return;
            try {
                const respTags: string[] = [];

                let evaled = eval(args.join(" "));

                if (evaled?.then && Functions.isFunction(evaled.then)) {
                    evaled = await evaled;
                    respTags.push("Resolved");
                }

                evaled = Functions.clean(util.inspect(evaled));

                msg.channel.send(
                    `${Emojis.SUCCESS} | **Success** ${respTags
                        .map((x) => `(${x})`)
                        .join(" ")}\n\`\`\`xl\n${Functions.shorten(
                        evaled,
                        1900
                    )}\`\`\``
                );
            } catch (err) {
                msg.channel.send(
                    `${
                        Emojis.DANGER
                    } | **Error**\n\`\`\`xl\n${Functions.shorten(
                        err.toString(),
                        1000
                    )}\`\`\``
                );
            }
        }
    );

    app.commands.add(command);
};

export default fn;
