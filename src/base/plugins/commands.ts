import Discord from "discord.js";
import commandLineArgs, { OptionDefinition } from "command-line-args";
import { Colors, Emojis, Functions } from "@/util";

export const ArgsParser = (args: string[], options: OptionDefinition[]) =>
    commandLineArgs(options, {
        argv: args,
        stopAtFirstUnknown: true,
    });
export type ArgsParserReturn = ReturnType<typeof ArgsParser>;

export const ArgsErrorFormatter = (err: any) => {
    switch (err.name) {
        case "UNKNOWN_OPTION":
            return `Unknown command option (\`${err.optionName}\`) was passed!`;

        case "UNKNOWN_VALUE":
            return `Unknown command value (\`${err.value}\`) was passed!`;

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

export interface ArgsOptions extends OptionDefinition {
    helpDesc: string;
    helpVal?: string | string[];
    optional: boolean;
}

export const CommandCategories = ["misc", "music", "anime", "image"] as const;
export type CommandCategoriesType = typeof CommandCategories[number];

export interface Command {
    name: string;
    description: string;
    aliases?: string[];
    cooldown?: number;
    category: CommandCategoriesType;
    args: ArgsOptions[];
}

export const getCommandHelpEmbed = (prefix: string, cmd: Command) => {
    const embed = new Discord.MessageEmbed();
    embed.setTitle(
        `${Emojis.INFO} | Command: ${Functions.capitalize(cmd.name)}`
    );

    const invokers = [cmd.name];
    if (cmd.aliases) invokers.push(...cmd.aliases);

    const desc = [
        `**Invokers**: ${invokers.map((x) => `\`${x}\``).join(", ")}`,
        `**Description**: ${cmd.description}`,
        `**Category**: ${Functions.capitalize(cmd.category)}`,
    ];
    if (cmd.cooldown) {
        desc.push(
            `**Cooldown**: ${Functions.humanizeDuration(
                Functions.parseMs(cmd.cooldown)
            )}`
        );
    }
    embed.setDescription(desc.join("\n"));

    const usage: string[] = [];

    const cmnUsage: string[] = [];
    const defArg = cmd.args.find((x) => x.defaultOption);
    if (defArg) {
        cmnUsage.push(
            `${prefix}${cmd.name} <${defArg.helpVal || defArg.name}>`
        );
    }
    cmnUsage.push(
        `${prefix}${cmd.name} ${cmd.args
            .map((x) => {
                let val = "value";
                if (x.helpVal)
                    val = Array.isArray(x.helpVal)
                        ? x.helpVal.join(" | ")
                        : x.helpVal;
                return `--${x.name} <${val}${x.multiple ? "..." : ""}>`;
            })
            .join(" ")}`
    );

    usage.push(`\`\`\`${cmnUsage.join("\n")}\`\`\``);
    if (cmd.args.length) {
        usage.push("__**Arguments**__");
        cmd.args.forEach((x) => {
            const ag = [`\`${x.name}\``];

            let val = "value";
            if (x.helpVal)
                val = Array.isArray(x.helpVal)
                    ? x.helpVal.join(" | ")
                    : x.helpVal;
            let us = [`--${x.name}`];
            if (x.alias) us.push(`-${x.alias}`);

            ag.push(
                `- **Usage**: ${us
                    .map((u) => `\`${u} <${val}${x.multiple ? "..." : ""}>\``)
                    .join(", ")}`
            );
            ag.push(`- **Description**: ${x.helpDesc}`);
            ag.push(
                `- **Type**: \`${
                    x.type && !!x.type.name
                        ? x.type.name.toLowerCase()
                        : "unknown"
                }\``
            );
            ag.push(
                `- **Takes multiple values**: ${x.multiple ? "Yes" : "No"}`
            );
            ag.push(`- **Optional**: ${x.optional ? "Yes" : "No"}`);
            if (x.defaultValue)
                ag.push(`- **Default value**: \`${x.defaultValue}\``);
            usage.push(ag.join("\n"));
        });
    }
    embed.addField(`${Emojis.CHAIN} Usage`, usage.join("\n"));
    embed.setTimestamp();
    embed.setColor(Colors.WHITE);

    return embed;
};

export type CommandRunMessageReturn = Parameters<
    typeof Discord.TextChannel.prototype.send
>[1];

export type CommandRun = (options: {
    msg: Discord.Message;
    contents: string[];
    args: ArgsParserReturn;
    prefix: string;
}) => Promise<CommandRunMessageReturn | void>;

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
