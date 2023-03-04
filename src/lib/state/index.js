import { writable } from "svelte/store";

const LOCAL_STORAGE_ITEM_NAME = "app:timetrack";
const isBrowser = typeof window !== "undefined";
let storageShadow = JSON.parse((isBrowser && localStorage.getItem(LOCAL_STORAGE_ITEM_NAME)) || "{}");
let initialized = false;

function updateLocalStorage(objectKey, value) {
  if (!isBrowser || !initialized) return;
  storageShadow[objectKey] = value;
  localStorage.setItem(LOCAL_STORAGE_ITEM_NAME, JSON.stringify(storageShadow));
}

export const getSyncInitial = () => ({ autoSync: false, lastDataChange: 0, lastSync: 0, lastSyncLocal: 0 });

export const timelineLog = writable(storageShadow.timelineLog || []);
export const activities = writable(storageShadow.activities || { list: [], tags: [] });
export const synchronization = writable(storageShadow.synchronization || getSyncInitial());
export const nonPersistent = writable({}); // { tokenInvalid, loading }

timelineLog.subscribe(v => updateLocalStorage("timelineLog", v));
activities.subscribe(v => updateLocalStorage("activities", v))
synchronization.subscribe(v => updateLocalStorage("synchronization", v));
initialized = true;
