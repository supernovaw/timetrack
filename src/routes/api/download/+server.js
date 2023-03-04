import { text } from "@sveltejs/kit";
import { check, handleDownload } from "../backend.server";

export function GET({ request }) {
    const user = request.headers.get("token");
    check(user);
    return text(handleDownload(user));
}
