import mongoose from "mongoose";

export interface GuildEntity {
    _id: string;
    prefix?: string;
}

export class ModelManager<T> {
    cache = new Map<string, T | null>();
    model: mongoose.Model<T>;

    constructor(model: mongoose.Model<T>) {
        this.model = model;
    }

    async get(id: string) {
        const cached = this.cache.get(id);
        if (cached !== undefined) return cached;

        const uncached = await this.model.findById(id);
        this.cache.set(id, uncached);
        return uncached;
    }

    async set(id: string, keys: mongoose.UpdateQuery<T>) {
        const updated = await this.model.findByIdAndUpdate(id, keys, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        });
        this.cache.set(id, updated);
        return updated;
    }

    async delete(id: string) {
        const deleted = await this.model.findByIdAndDelete(id);
        this.cache.set(id, null);
        return deleted;
    }
}

export class Database {
    static schemas = {
        guild: new mongoose.Schema<GuildEntity>({
            _id: String,
            prefix: String,
        }),
    };

    static models = {
        guild: new ModelManager(
            mongoose.model<GuildEntity>("guild", Database.schemas.guild)
        ),
    };

    static connect() {
        if (!process.env.MONGOOSE_URL)
            throw new Error("Missing 'process.env.MONGOOSE_URL'");

        return mongoose.connect(process.env.MONGOOSE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
    }
}
