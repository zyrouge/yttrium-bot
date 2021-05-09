import axios from "axios";
import cheerio from "cheerio";
import { Constants } from "@/util";

export const TopAnimeTypes = [
    "airing",
    "upcoming",
    "tv",
    "movie",
    "ova",
    "ona",
    "special",
    "bypopularity",
    "favorite",
] as const;
export type TopAnimeTypesType = typeof TopAnimeTypes[number];

export interface TopAnimesOptions {
    type?: TopAnimeTypesType;
}

export interface TopAnimeEntity {
    rank: string;
    title: string;
    url: string;
    score: string;
    series: string;
    run: string;
}

export const TopAnimes = async (options: TopAnimesOptions) => {
    const { data } = await axios.get(
        Constants.urls.animeList.top(options.type),
        {
            responseType: "text",
        }
    );

    const animes: TopAnimeEntity[] = [];
    const $ = cheerio.load(data);
    $(".ranking-list").each(function () {
        const ele = $(this);

        const rank = ele.find(".rank").text().trim();
        const titleEle = ele.find(".title h3 a");

        const title = titleEle.text().trim();
        const url = titleEle.attr("href");
        if (!url) return;

        const score = ele.find(".score").text().trim();
        const [series, run] = ele
            .find(".information")
            .text()
            .trim()
            .split("\n")
            .map((x) => x.trim());

        animes.push({
            rank,
            title,
            url,
            score,
            series,
            run,
        });
    });

    console.log(animes[0]);
};
