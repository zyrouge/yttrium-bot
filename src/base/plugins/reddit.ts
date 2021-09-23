import { Assets } from "@/utils/assets";
import { Colors } from "@/utils/colors";
import { RegExpUtils } from "@/utils/regex";
import { StringUtils } from "@/utils/string";
import axios from "axios";
import { MessageEmbed } from "discord.js";

export interface RedditOptions {
    image?: boolean;
    nsfw?: boolean;
}

export interface RedditPost {
    title: string;
    subreddit: {
        name: string;
        subreddit: string;
        url: string;
        subscribers: number;
    };
    url: string;
    image: string;
    thumbnail: string;
    score: number;
    likes: number;
    dislikes: number;
    comments: number;
    nsfw: boolean;
}

export const Reddit = {
    async fetch(subreddit: string, options: RedditOptions = {}) {
        options.image = options.image || true;
        options.nsfw = options.nsfw || false;

        const base = `https://api.reddit.com/r/${subreddit}/random`;
        const { data } = await axios.get(base, {
            responseType: "json",
        });
        if (!data) throw new Error("No such subreddit was found");

        let listing;
        if (Array.isArray(data)) listing = data[0].data;
        else if (typeof data == "object") listing = data.data;
        if (!listing) throw new Error("No listing was found");

        const post = listing.children[0] ? listing.children[0].data : false;
        if (!post) throw new Error("No posts was found");
        if (post.over_18 && !options.nsfw)
            throw new Error("Post found was NSFW");

        let image = null;
        if (
            post.crosspost_parent_list &&
            post.crosspost_parent_list.secure_media &&
            post.crosspost_parent_list.secure_media.thumbnail_url &&
            RegExpUtils.url.test(
                post.crosspost_parent_list.secure_media.thumbnail_url
            )
        )
            image = post.crosspost_parent_list.secure_media.thumbnail_url;
        if (post.url && RegExpUtils.url.test(post.url)) image = post.url;

        const result: RedditPost = {
            title: post.title,
            subreddit: {
                name: post.subreddit_name_prefixed,
                subreddit: post.subreddit_name_prefixed,
                url: `https://reddit.com/${post.subreddit_name_prefixed}`,
                subscribers: post.subreddit_subscribers || 0,
            },
            url: `https://reddit.com${post.permalink}`,
            image,
            thumbnail:
                post.thumbnail && RegExpUtils.url.test(post.thumbnail)
                    ? post.thumbnail
                    : undefined,
            score: post.score || undefined,
            likes: post.ups || 0,
            dislikes: post.downs || 0,
            comments: post.num_comments,
            nsfw: post.over_18,
        };

        return result;
    },
    embedify(post: RedditPost) {
        const embed = new MessageEmbed();
        embed.setTitle(StringUtils.shorten(post.title, 500));

        if (post.url) embed.setURL(post.url);
        if (post.image || post.thumbnail)
            embed.setImage(post.image || post.thumbnail);

        embed.setColor(Colors.REDDIT_ORANGE);
        embed.setTimestamp();
        embed.setFooter(
            `${post.subreddit.subreddit} | 👍 ${post.likes} | 👎 ${post.dislikes}`,
            Assets.reddit
        );

        return embed;
    },
};
