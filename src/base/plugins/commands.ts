import Discord from "discord.js";
import commandLineArgs, { OptionDefinition } from "command-line-args";

export const ArgsParser = (args: string[], options: OptionDefinition[]) =>
    commandLineArgs(options, { argv: args });
export type ArgsParserReturn = ReturnType<typeof ArgsParser>;

export const ArgsErrorFormatter = (err: any) => {
    switch (err.name) {
        case "UNKNOWN_OPTION":
            return `Invalid command option (\`${err.optionName}\`) was passed!`;

        case "UNKNOWN_VALUE":
            return `Invalid command value (\`${err.value}\`) was passed!`;

        case "ALREADY_SET":
            return `Duplicate command option (\`${err.optionName}\`${
                err.value ? ` with value \`${err.value}\`` : ""
            }) was passed!`;

        case "INVALID_DEFINITIONS":
            return `Invalid command definition (\`${err.optionName}\`) was passed!`;

        default:
            return err.toString();
    }
};

export interface Command {
    name: string;
    description: string;
    aliases?: string[];
    usage?: string;
    cooldown?: number;
    category: "misc" | "music" | "anime";
    args: OptionDefinition[];
}

export type CommandRun = (options: {
    msg: Discord.Message;
    contents: string[];
    args: ArgsParserReturn;
    prefix: string;
}) => any;

export class Command {
    run: CommandRun;

    constructor(props: Omit<Command, "run">, run: CommandRun) {
        if (!props.name || !props.description || !props.category)
            throw new Error("Invalid 'props' were passed into 'Command'");

        Object.assign(this, props);
        this.run = run;
    }
}

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
