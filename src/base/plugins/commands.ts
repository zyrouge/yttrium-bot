import Discord from "discord.js";

export const CommandCategories = ["misc", "music"] as const;
export type CommandCategoryType = typeof CommandCategories[number];

export interface CommandProps {
    name: string;
    description: string;
    aliases?: string[];
    usage?: string;
    cooldown?: number;
    category: CommandCategoryType;
}

export type CommandMessage = Discord.Message & {
    guild: Discord.Guild;
    member: Discord.GuildMember;
    channel: Discord.TextChannel;
};

export type CommandRun = (options: {
    msg: CommandMessage;
    args: string[];
    prefix: string;
}) => any;

export const createCommand = (props: CommandProps, run: CommandRun) => {
    return {
        ...props,
        run,
        getUsage(prefix: string = "") {
            let usage = prefix + this.name;
            if (this.usage) prefix += this.usage;
            return usage;
        },
    };
};

export type Command = ReturnType<typeof createCommand>;

export class CommandManager {
    commands: Map<string, Command>;
    aliases: Map<string, string>;

    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
    }

    add(command: Command) {
        if (this.commands.has(command.name))
            throw new Error(
                `Command with name '${command.name}' already exists`
            );
        this.commands.set(command.name, command);

        command.aliases?.forEach((alias) => {
            if (this.aliases.has(alias))
                throw new Error(`Command with alias '${alias}' already exists`);
            this.aliases.set(alias, command.name);
        });
    }

    resolve(name: string) {
        const alias = this.aliases.get(name);
        return this.commands.get(alias || name);
    }
}
