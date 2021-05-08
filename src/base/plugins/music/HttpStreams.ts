import { URL } from "url";
import { Util } from "discord-player";
import { Constants } from "@/util";

const validate = (str: string) => {
    const query = Util.getQueryType(str);
    return query === "youtube_search" && Constants.regex.url.test(str);
};

const getInfo = (query: string) => {
    const { host, origin, href: url } = new URL(query);

    return {
        title: `Stream - ${host}`,
        duration: 0,
        thumbnail:
            "https://upload.wikimedia.org/wikipedia/commons/2/2a/ITunes_12.2_logo.png",
        engine: url,
        views: 0,
        author: origin,
        description: "",
        url: url,
    };
};

const important = false;

export default {
    getInfo,
    validate,
    important,
};
