import { AppFile } from "@/base/app";
import { Logger } from "@/utils/logger";

const fn: AppFile = (app) => {
    app.bot.on("ready", () => {
        Logger.info(
            `Logged in as ${app.bot.user?.username}#${app.bot.user?.discriminator}!`
        );
    });
};

export default fn;
