import { AppFile } from "@/base/app";
import { Logger } from "@/util";

const fn: AppFile = (app) => {
    app.plugins.music.on("nodeError", (node, err) => {
        Logger.error(
            `Lavalink node (${node.options.host}) error: ${err?.message}`
        );
    });
};

export default fn;
