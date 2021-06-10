import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { Colors, Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "avatar",
            description: "Sends a user's avatar",
            aliases: ["av", "pfp"],
            category: "misc",
            args: [
                {
                    name: "user",
                    alias: "u",
                    type: String,
                    defaultOption: true,
                    helpDesc: "Discord User",
                    helpVal: "@zyrouge",
                    optional: true,
                },
            ],
        },
        async ({ msg, args }) => {
            try {
                const user =
                    msg.mentions.users.first() ||
                    (<string>args.user &&
                        (await app.bot.users
                            .fetch(<`${bigint}`>args.user)
                            .catch(() => null))) ||
                    msg.author;

                const avatar = user.displayAvatarURL({
                    dynamic: true,
                    size: 4096,
                });

                return {
                    embed: {
                        title: `${Emojis.CAMERA} | Avatar of ${user.tag}`,
                        description: `Image URL: \`${avatar}\``,
                        image: {
                            url: avatar,
                        },
                        timestamp: Date.now(),
                        color: Colors.WHITE,
                    },
                };
            } catch (err) {
                return {
                    content: `${Emojis.SAD} | Something went wrong! (${err})`,
                };
            }
        }
    );

    app.plugins.commands.add(command);
};

export default fn;
