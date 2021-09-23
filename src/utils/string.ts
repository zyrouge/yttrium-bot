export const StringUtils = {
    clean: (text: string) =>
        text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203)),
    shorten: (text: string, length: number, dots: boolean = true) =>
        text.length > length
            ? text.slice(0, length - 3) + (dots ? "..." : "")
            : text,
    capitalize: (text: string) =>
        text
            .split(" ")
            .map((x) => `${x[0].toUpperCase()}${x.slice(1)}`)
            .join(" "),
};
