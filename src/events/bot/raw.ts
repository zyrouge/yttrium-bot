import { AppFile } from "@/base/app";

const fn: AppFile = (app) => {
    app.bot.on("raw", (packet) => {
        app.plugins.music.updateVoiceState(packet);
    });
};

export default fn;
