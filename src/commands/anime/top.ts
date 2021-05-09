import { AppFile } from "@/base/app";
import { Command } from "@/base/plugins/commands";
import { TopAnimes } from "@/base/plugins/animelist/top";
import { Emojis } from "@/util";

const fn: AppFile = (app) => {
    const command = new Command(
        {
            name: "topanimes",
            description: "Shows top animes",
            aliases: ["topanimes", "tanime", "tanimes"],
            category: "anime",
        },
        async ({ msg }) => {}
    );

    app.commands.add(command);
};

export default fn;
