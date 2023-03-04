import { text } from "@sveltejs/kit";
import { check } from "../backend.server";

export function GET({ request }) {
    const user = request.headers.get("token");
    const lastSync = check(user);
    return text(lastSync);
}
