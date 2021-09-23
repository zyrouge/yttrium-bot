import { AppFile } from "@/base/app";
import { Logger } from "@/utils/logger";

const fn: AppFile = (app) => {
    app.bot.on("disconnect", () => {
        Logger.info(`Disconnected from Discord API!`);
    });
};

export default fn;
