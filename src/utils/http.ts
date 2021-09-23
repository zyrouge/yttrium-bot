export const Http = {
    UserAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    parseHost: (url: string) => url.match(/https?:\/\/([^/]+)/)![1],
};
