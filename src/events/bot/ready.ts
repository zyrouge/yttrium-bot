import { AppFile } from "@/base/app";
import { Logger } from "@/util";

const fn: AppFile = (app) => {
    app.bot.on("ready", () => {
        app.plugins.music.init(app.bot.user!.id);
        Logger.info(
            `Logged in as ${app.bot.user?.username}#${app.bot.user?.discriminator}!`
        );
    });
};

export default fn;
