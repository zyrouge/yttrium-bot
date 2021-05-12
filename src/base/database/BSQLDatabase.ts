import { dirname } from "path";
import { ensureDirSync } from "fs-extra";
import bsql from "better-sqlite3";

export const BSQLDatabase = (path: string, options?: bsql.Options) => {
    const dir = dirname(path);
    ensureDirSync(dir);

    const sql = new bsql(path, options);
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = WAL");

    return sql;
};
