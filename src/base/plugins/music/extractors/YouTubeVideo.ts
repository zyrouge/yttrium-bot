import { videoInfo, getFormats } from "youtube-ext";
import { Track } from "@/base/plugins/music/track";
import { Constants } from "@/util";

export const validate = (str: string) => Constants.regex.youtubeVideo.test(str);

export const parse = async (query: string) => {
    const headers: Record<string, any> = {
        cookie: process.env.YT_COOKIE,
    };

    const info = await videoInfo(query, {
        requestOptions: {
            headers,
        },
    });

    const track: Omit<Track, "requester"> = {
        title: info.title,
        thumbnail: info.thumbnails.sort((a, b) => b.height - a.height)[0]?.url,
        url: info.url,
        duration: +info.duration.lengthSec * 1000,
        source: "YouTube",
        async getStream() {
            const { streams } = await videoInfo(this.url, {
                requestOptions: {
                    headers,
                },
            });

            const formats = await getFormats(streams);
            const format = formats.find((x) => x.audioChannels && x.fps);
            if (!format) throw new Error("Could not find appropriate format");
            return {
                url: format.url,
                options: {
                    headers,
                },
            };
        },
    };

    return track;
};
