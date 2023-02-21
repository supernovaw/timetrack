import { writable } from "svelte/store";

let total = 0;
const genId = () => ++total;

export const store = writable([]);

function add(text, group) {
    const id = genId();
    const popup = {
        id,
        text,
        group,
        disappearPrevented: false,
    };
    store.update(arr => { arr.push(popup); return arr; });
    return id;
}

// Removes popup with id in case it's disappearPrevented is not set
function autoRemove(id) {
    store.update(arr => arr.filter(p => (p.id !== id) || p.disappearPrevented));
}

export default function popup(text, group = "default") {
    const id = add(text, group);
    setTimeout(() => autoRemove(id), 5_000); // duration has to match animation
}
