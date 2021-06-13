import { Client } from "discord.js";
import { Manager, NodeOptions, Structure, Player } from "erela.js";

Structure.extend(
    "Player",
    (Player) =>
        class extends Player {
            lastMessageID = undefined;
        }
);

export const createMusicManager = (client: Client, nodes: NodeOptions[]) => {
    return new Manager({
        nodes,
        send: (id, payload) => {
            const guild = client.guilds.cache.get(<`${bigint}`>id);
            if (guild) guild.shard.send(payload);
        },
    });
};
