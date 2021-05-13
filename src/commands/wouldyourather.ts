import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { WouldYouRather } from "@/base/plugins/wouldyourather";
import { Colors, Emojis, Functions } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "wouldyourather",
            description: "Would you rather?",
            aliases: ["wyr"],
            category: "fun",
            args: [],
        },
        async () => {
            return {
                embed: {
                    title: `${Emojis.THINKING} | ${Functions.random(
                        WouldYouRather
                    )}`,
                    color: Colors.WHITE,
                },
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
