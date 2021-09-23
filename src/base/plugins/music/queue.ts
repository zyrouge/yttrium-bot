import { Track } from "./track";

export class Queue {
    currentIndex?: number;
    tracks: Track[] = [];

    empty() {
        this.tracks = [];
    }

    get current() {
        return typeof this.currentIndex === "number"
            ? this.tracks[this.currentIndex]
            : undefined;
    }
}
