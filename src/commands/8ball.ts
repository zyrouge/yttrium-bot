import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { EightBall } from "@/base/plugins/eightball";
import { Colors, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "8ball",
            description: "Ask your question to the 8ball",
            aliases: ["eightball"],
            category: "fun",
            args: [
                {
                    name: "question",
                    alias: "q",
                    type: String,
                    defaultOption: true,
                    multiple: true,
                    helpDesc: "Question to be prompted",
                    optional: false,
                },
            ],
        },
        async ({ args }) => {
            if (!args.question) {
                return {
                    content: `${Emojis.SAD} | Eightball won't response until you prompt a question!`,
                };
            }

            const question: string = args.question.join(" ");
            if (!/\?$/.test(question)) {
                return {
                    content: `${Emojis.SAD} | Doesn't seem to be a question! Are you using the question mark?`,
                };
            }

            return {
                content: `${Emojis.EIGHTBALL} | ${Functions.random(EightBall)}`,
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
