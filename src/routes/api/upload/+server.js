import { error, json } from "@sveltejs/kit";
import { check, handleUpload } from "../backend.server";
import validate from "$lib/timeline/validate";

const STORAGE_LIMIT_MB = 2;

export async function POST({ request }) {
    const user = request.headers.get("token");
    check(user);

    const length = +request.headers.get("content-length");
    if (length > STORAGE_LIMIT_MB * 0x100000)
        throw error(413, `User data is restricted to ${STORAGE_LIMIT_MB} MiB`);

    const now = parseInt(+new Date() / 1000);
    let timestamp = parseInt(request.headers.get("timestamp"));
    if (isNaN(timestamp)) timestamp = now;
    if (timestamp > now) timestamp = now;
    else if (timestamp < (now - 10)) timestamp = now;

    handleUpload(user, timestamp, await parseBody(request));
    return json({ message: "Upload successful" });
}

async function parseBody(request) {
    let obj;
    try {
        obj = await request.json();
    } catch (e) {
        throw error(400, "Invalid JSON");
    }

    if (typeof obj !== "object" || Array.isArray(obj))
        throw error(400, "Invalid request");
    if (Object.keys(obj).length > 2)
        throw error(400, "Invalid object fields");
    if (!obj.timelineLog || !obj.activities)
        throw error(400, "Missing object fields");
    const validationError = validate(obj.timelineLog, obj.activities);
    if (validationError)
        throw error(400, "JSON validation failed: " + validationError);

    return obj;
}
