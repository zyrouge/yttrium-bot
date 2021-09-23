import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { WouldYouRather } from "@/base/plugins/wouldyourather";
import { ArrayUtils } from "@/utils/array";
import { Colors } from "@/utils/colors";
import { Emojis } from "@/utils/emojis";

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
                embeds: [
                    {
                        title: `${Emojis.THINKING} | ${ArrayUtils.random(
                            WouldYouRather
                        )}`,
                        color: Colors.WHITE,
                    },
                ],
            };
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
