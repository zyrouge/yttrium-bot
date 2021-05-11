import fs from "fs-extra";

export interface CacheInfo {
    lastUpdated: number;
}

export const getCacheInfo = async <T = CacheInfo>(
    path: string
): Promise<T | void> => {
    try {
        const buf = await fs.readFile(path);
        const info: T = JSON.parse(buf.toString());
        return info;
    } catch (err) {
        throw err;
    }
};

export const updateCacheInfo = async <T = CacheInfo>(
    path: string,
    data: T
): Promise<T | void> => {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 4));
    } catch (err) {
        throw err;
    }
};
