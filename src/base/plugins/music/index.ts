import { App } from "../../app";
import { Player } from "./player";

export class MusicManager {
    #app: App;

    store = new Map<string, Player>();

    constructor(app: App) {
        this.#app = app;
    }

    get(id: string) {
        return this.store.get(id);
    }
}
