import { Client, ClientOptions } from "discord.js";

export interface BotOptions {
    token: string;
    clientOptions: ClientOptions;
}

export class Bot extends Client {
    connect: typeof Client.prototype.login;

    constructor(options: BotOptions) {
        super(options.clientOptions);

        this.connect = super.login.bind(this, options.token);
    }
}
