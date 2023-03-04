import fs from "fs";
import crypto from "crypto";
import { error } from "@sveltejs/kit";

const FS_APP_ROOT = process.env.FS_APP_ROOT ? process.env.FS_APP_ROOT + "/" : "";
const DIR = FS_APP_ROOT + "user-storage";
const MAX_USERS = 3;
let users;
let cache = {};

init();
function init() {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR);

    // Each user has a file of the form: "63ff4ead11939f6b.json" with contents of
    // type { lastSync: number, data?: { timelineLog: array, activities: object } }
    users = new Set(fs.readdirSync(DIR).map(file => {
        if (!fs.statSync(`${DIR}/${file}`).isFile()) return undefined;
        const match = file.match(/^([0-9a-f]{16})\.json$/);
        return match ? match[1] : undefined;
    }).filter(v => v));
}

function read(user) {
    if (!users.has(user)) return;
    if (cache[user]) return cache[user];
    const json = JSON.parse(fs.readFileSync(`${DIR}/${user}.json`, "utf8"));
    return cache[user] = json;
}

function write(user, json) {
    if (!users.has(user)) return;
    cache[user] = json;
    fs.writeFileSync(`${DIR}/${user}.json`, JSON.stringify(json), "utf8");
}

export function register(request) {
    if (users.size >= MAX_USERS) {
        fs.appendFileSync(
            `${DIR}/abuse.log`,
            `${new Date().toISOString()} from '${request.getClientAddress()}'\n`
        );
        throw error(429);
    }
    const user = crypto.randomBytes(8).hexSlice();
    users.add(user);
    write(user, { lastSync: 0 });
    return user;
}

export function check(user) {
    if (!users.has(user)) throw error(401);
    return read(user).lastSync;
}

export function handleUpload(user, timestamp, data) {
    check(user);
    write(user, { lastSync: timestamp, data });
}

export function handleDownload(user) {
    return JSON.stringify(read(user).data);
}
