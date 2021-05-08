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
            "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
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
