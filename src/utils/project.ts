import util from "util";
import cp from "child_process";

const exec = util.promisify(cp.exec);

const pkgJson = require("../../package.json");

export const Project = {
    codeName: pkgJson.name as string,
    version: pkgJson.version as string,
    github: (pkgJson.repository?.url?.replace(/^(git\+)|(.git)$/g, "") ||
        "Unknown") as string,
    author: (pkgJson.author || "Unknown") as string,
    _sha: null as string | null,
    async getSHA() {
        if (Project._sha) return Project._sha;
        if (Project.github === "Unknown") return null;
        const { stdout } = await exec(
            `git ls-remote ${Project.github}.git refs/heads/main`
        );
        const sha = (Project._sha = stdout.match(/\w+/)?.[0] || "Unknown");
        return sha;
    },
};
