import { URL } from "url";
import { Track } from "@/base/plugins/music/track";
import { Constants } from "@/util";

export const validate = (str: string) => Constants.regex.url.test(str);

export const parse = (query: string) => {
    const { host, href: url } = new URL(query);

    const track: Omit<Track, "requester"> = {
        title: `Stream - ${host}`,
        thumbnail:
            "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        url: url,
        source: "URL Stream",
        async getStream() {
            return {
                url: this.url,
            };
        },
    };

    return track;
};
