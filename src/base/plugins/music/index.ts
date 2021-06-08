import { Client } from "discord.js";
import { Manager, NodeOptions } from "erela.js";

export const createMusicManager = (client: Client, nodes: NodeOptions[]) => {
    return new Manager({
        nodes,
        send: (id, payload) => {
            const guild = client.guilds.cache.get(<`${bigint}`>id);
            if (guild) guild.shard.send(payload);
        },
    });
};
