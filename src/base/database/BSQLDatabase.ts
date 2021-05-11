import fs from "fs-extra";
import path from "path";
import bsql from "better-sqlite3";

export interface SchemaParserAttribute {
    type: string;
    constraints?: string[];
}

export const SchemaParser = (
    schema: Record<string, string | SchemaParserAttribute> = {}
) => {
    const keys: string[] = [];

    Object.entries(schema).forEach(([key, opts]) => {
        let type: string,
            constraints: string[] = [];

        if (typeof opts === "object") {
            type = opts.type;
            if (opts.constraints) constraints = opts.constraints;
        } else type = opts;

        let res = `${key} ${type}`;
        if (constraints.length) res += ` ${constraints.join(" ")}`;

        keys.push(res);
    });

    return keys.join(", ");
};

export interface BSQLDatabaseOptions {
    path: string;
    name: string;
    schema: Record<string, string | SchemaParserAttribute>;
    sqlOptions?: bsql.Options;
}

export class BSQLDatabase {
    path: string;
    name: string;
    schema: string;
    sql: bsql.Database;
    ready: boolean;

    constructor(options: BSQLDatabaseOptions) {
        if (!options.path)
            throw new Error("Missing 'options.path' in 'Database'");
        this.path = options.path;

        const dir = path.dirname(this.path);
        fs.ensureDirSync(dir);

        if (!options.name)
            throw new Error("Missing 'options.name' in 'Database'");
        this.name = options.name;

        if (!options.schema)
            throw new Error("Missing 'options.schema' in 'Database'");
        this.schema = SchemaParser(options.schema);

        this.sql = new bsql(this.path, options.sqlOptions);
        this.ready = false;
    }

    prepare() {
        const initial = this.sql
            .prepare(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name= ?;"
            )
            .get(this.name);

        if (!initial["count(*)"]) {
            this.sql
                .prepare(`CREATE TABLE ${this.name} (${this.schema});`)
                .run();

            this.sql.pragma("synchronous = 1");
            this.sql.pragma("journal_mode = WAL");
        }

        this.ready = true;
    }
}
