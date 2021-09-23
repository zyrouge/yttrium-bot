export const RegExpUtils = {
    discordMention: (id: string = "\\d+", flags?: string) =>
        new RegExp(`<@!?${id}>`, flags),
    url: /^(https?:\/\/)/,
    jpgOrPng: /.(jpg|jpeg|png)$/,
};
