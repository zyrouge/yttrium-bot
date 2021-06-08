import { Node as ErelaNode } from "erela.js";
import { AppFile } from "@/base/app";
import { Logger } from "@/util";

const fn: AppFile = (app) => {
    const handle = (ev: "connect" | "reconnect", node: ErelaNode) => {
        Logger.info(
            `${
                ev === "reconnect" ? "Reconnected" : "Connected"
            } to Lavalink node (${node.options.host})`
        );
    };

    app.plugins.music.on("nodeConnect", (node) => handle("connect", node));
    app.plugins.music.on("nodeReconnect", (node) => handle("reconnect", node));

    app.plugins.music.on("nodeDisconnect", (node, reason) => {
        Logger.info(
            `Lavalink node disconnected (${node.options.host}) (${reason.code} - ${reason.reason})`
        );
    });
};

export default fn;
