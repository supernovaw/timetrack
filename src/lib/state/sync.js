import { API_URL } from "$lib/consts";
import {
    timelineLog,
    activities,
    synchronization,
    nonPersistent,
} from ".";
import validate from "$lib/timeline/validate";
import popup from "$lib/popups/";
export default function init() { }
let initialized = false;
let autoUploadTimeoutId;

const AUTO_UPLOAD_TIMEOUT = 15_000;

let data = {};
let synchronizationValue;
let nonPersistentValue;

timelineLog.subscribe(v => { data.timelineLog = v; onDataChanged() });
activities.subscribe(v => { data.activities = v; onDataChanged() });
synchronization.subscribe(v => synchronizationValue = v);
nonPersistent.subscribe(v => nonPersistentValue = v);

const setLoading = bool => nonPersistent.update(v => { v.loading = bool; return v });
const markTokenInvalid = () => nonPersistent.update(v => { v.tokenInvalid = true; return v });

// Schedules auto-upload if autoSync is true
function onDataChanged() {
    if (!initialized) return;
    synchronization.update(v => {
        v.lastDataChange = +new Date() / 1000;
        return v;
    });
    if (synchronizationValue.autoSync) {
        if (autoUploadTimeoutId) clearInterval(autoUploadTimeoutId);
        autoUploadTimeoutId = setTimeout(autoUpload, AUTO_UPLOAD_TIMEOUT);
    }
}

function autoUpload() {
    autoUploadTimeoutId = undefined;
    if (!synchronizationValue.autoSync) return;
    if (nonPersistentValue.loading) return;
    upload(true);
}

async function getMsg(response) {
    const text = await response.text();
    try {
        let json = JSON.parse(text);
        return json.message || `${response.status} / ${response.statusText}`;
    } catch (e) {
        return response.status + " / " + text;
    }
}

export async function upload(isAutomatic = false) {
    if (typeof isAutomatic !== "boolean") isAutomatic = false; // special case for on:click handlers

    if (autoUploadTimeoutId) clearInterval(autoUploadTimeoutId);
    if (nonPersistentValue.loading) return;
    const popupLocal = msg => popup(msg, isAutomatic ? undefined : "SynchronizationDialog");

    const timestamp = parseInt(+new Date() / 1000);
    const body = JSON.stringify(data);

    setLoading(true);
    fetch(API_URL + "/upload", {
        method: "POST",
        body,
        headers: { token: synchronizationValue.token, timestamp },
    })
        .then(async res => {
            if (res.status === 200) {
                synchronization.update(v => {
                    v.lastSync = timestamp;
                    v.lastSyncLocal = timestamp;
                    v.lastDataChange = timestamp;
                    return v;
                });
            } else if (res.status === 401) {
                markTokenInvalid();
                popupLocal("Authorisation token is invalid");
            } else if (res.status === 413) {
                popupLocal(`Upload failed, timeline size too large (${(body.length / 1000_000).toFixed(1)} MB)`);
            } else {
                popupLocal(`Upload failed (${await getMsg(res)})`);
            }
        })
        .catch(err => popupLocal(`Upload failed (${err.message})`))
        .finally(() => setLoading(false));
}

export async function download(isAutomatic = false) {
    if (typeof isAutomatic !== "boolean") isAutomatic = false;

    if (nonPersistentValue.loading) return;
    const popupLocal = msg => popup(msg, isAutomatic ? undefined : "SynchronizationDialog");

    setLoading(true);
    fetch(API_URL + "/download", { headers: { token: synchronizationValue.token } })
        .then(async res => {
            if (res.status === 200) {
                const json = await res.json();
                if (typeof json !== "object")
                    throw new Error(`Server response is not an object (${typeof json})`)
                const validationError = validate(json.timelineLog, json.activities);
                if (validationError)
                    throw new Error(`Server response failed validation (${validationError})`);

                timelineLog.set(json.timelineLog);
                activities.set(json.activities);
                synchronization.update(v => { v.lastSyncLocal = +new Date() / 1000; return v });
            } else if (res.status === 401) {
                markTokenInvalid();
                popupLocal("Authorisation token is invalid");
            } else {
                popupLocal(`Synchronisation download failed (${await getMsg(res)})`);
            }
        })
        .catch(err => popupLocal(`Synchronisation download failed (${err.message})`))
        .finally(() => setLoading(false));
}

if (typeof window !== "undefined") {
    initialized = true;

    if (synchronizationValue.autoSync) {
        const changesToUpload = synchronizationValue.lastDataChange > synchronizationValue.lastSyncLocal;
        const changesToDownload = synchronizationValue.lastSync > synchronizationValue.lastSyncLocal;
        if (changesToUpload && !changesToDownload)
            autoUpload();
        if (changesToDownload && !changesToUpload)
            download(true);
        if (changesToDownload && changesToUpload)
            popup("There are unsent changes as well as not synchronised changes."
                + " Go to settings to either download or upload changes.");
    }
}
