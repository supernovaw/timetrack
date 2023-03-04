import { text } from "@sveltejs/kit";
import { register } from "../backend.server";

export function POST(request) {
    return text(register(request));
}
