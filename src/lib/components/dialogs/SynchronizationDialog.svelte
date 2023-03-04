<script>
    import { slide } from "svelte/transition";
    import { onMount } from "svelte";
    import { synchronization, getSyncInitial, nonPersistent } from "$lib/state/";
    import CheckIconButton from "../icons/CheckIconButton.svelte";
    import { API_URL } from "$lib/consts";
    import { upload, download } from "$lib/state/sync";
    import Dialog from "../Dialog.svelte";
    import popup from "$lib/popups/";
    import Popups from "$lib/popups/Popups.svelte";
    import ConfirmDialog from "./ConfirmDialog.svelte";
    import formatDuration from "$lib/timeline/durationFormatter";
    import moment from "moment";
    import initSync from "$lib/state/sync";
    initSync();

    export let shown, onClosed;

    $: isLoading = $nonPersistent.loading;
    let confirmDialog;
    const popupLocal = (msg) => popup(msg, "SynchronizationDialog");

    let enteredToken = "";
    let showToken = false;
    $: shown && (enteredToken = "");
    $: shown && (showToken = false);

    let lastSyncLocalStr, lastSyncLocalAgo;
    $: shown && updateLastSyncLocalStrings($synchronization.lastSyncLocal);
    function updateLastSyncLocalStrings(t) {
        if (t) {
            const elapsed = +new Date() - t * 1000;
            lastSyncLocalStr = moment(t * 1000).format("YYYY MMM DD HH:mm:ss Z");
            lastSyncLocalAgo =
                elapsed > 60_000 ? formatDuration(elapsed) + " ago" : "less than 1 minute ago";
        } else {
            lastSyncLocalStr = undefined;
            lastSyncLocalAgo = "N/A";
        }
    }

    function handleCheck(_, token = enteredToken) {
        if (isLoading) return;
        if (!token) return;
        $nonPersistent.loading = true;
        fetch(API_URL + "/check", { headers: { token } })
            .then(async (res) => {
                if (res.status === 200) {
                    $synchronization.token = token;
                    $synchronization.lastSync = parseInt(await res.text());
                    $nonPersistent.tokenInvalid = false;
                    enteredToken = "";
                } else if (res.status === 401) {
                    popupLocal("Token is invalid");
                } else {
                    popupLocal(`Error (${res.status} / ${res.statusText})`);
                }
            })
            .catch((err) => popupLocal(err.message))
            .finally(() => ($nonPersistent.loading = false));
    }

    function handleRegister() {
        if (isLoading) return;
        confirmDialog = {
            text: "Confirm creating a new token (i.e. a new account)",
            yesHandler: () => {
                $nonPersistent.loading = true;
                fetch(API_URL + "/register", { method: "POST" })
                    .then(async (res) => {
                        if (res.status === 200) {
                            $synchronization = { ...getSyncInitial(), token: await res.text() };
                        } else if (res.status === 429) {
                            popupLocal("Error: server overloaded");
                        } else {
                            popupLocal(`Error (${res.status} / ${res.statusText})`);
                        }
                    })
                    .catch((err) => popupLocal(err.message))
                    .finally(() => ($nonPersistent.loading = false));
            },
        };
    }

    function handleCopy(e) {
        navigator.clipboard.writeText($synchronization.token);
        e.target.setAttribute("disabled", "true");
    }

    function handleLogout() {
        if (isLoading) return;
        confirmDialog = {
            text: "Confirm logging out",
            yesHandler: () => {
                $synchronization = getSyncInitial();
                $nonPersistent.tokenInvalid = false;
            },
        };
    }

    function handleToggleAutoSync() {
        $synchronization.autoSync = !$synchronization.autoSync;
    }

    onMount(() => {
        // Automatically check token on startup
        if (isLoading) return; // If auto-sync has been triggered by sync.js, don't proceed here
        if (!$synchronization.token || $nonPersistent.tokenInvalid) return;
        $nonPersistent.loading = true;
        fetch(API_URL + "/check", { headers: { token: $synchronization.token } })
            .then(async (res) => {
                if (res.status === 200) {
                    $synchronization.lastSync = parseInt(await res.text());
                } else if (res.status === 401) {
                    $nonPersistent.tokenInvalid = true;
                    popup("Authorisation token is invalid");
                } else {
                    popup(
                        `Failed to check authorisation token (${res.status} / ${res.statusText})`
                    );
                }
            })
            .catch((err) => popup(`Failed to check authorisation token (${err.message})`))
            .finally(() => ($nonPersistent.loading = false));
    });
</script>

<Dialog {shown} {onClosed}>
    {#if $synchronization.token && !$nonPersistent.tokenInvalid}
        <div class="main" transition:slide|local>
            <div class="flex">
                You are logged in
                <button on:click={handleLogout} aria-busy={isLoading}>Log out</button>
            </div>
            <div>
                {#if !showToken}
                    <div class="extended flex" transition:slide|local>
                        <button on:click={() => (showToken = true)}>Show token</button>
                    </div>
                {:else}
                    <div class="extended flex" transition:slide|local>
                        <button on:click={() => (showToken = false)}>Hide</button>
                        <span style="font-family: monospace">{$synchronization.token}</span>
                        <button on:click={handleCopy}>Copy</button>
                    </div>
                {/if}
            </div>
            <div class="flex">
                Auto sync is turned {$synchronization.autoSync ? "on" : "off"}
                <button on:click={handleToggleAutoSync}>Toggle</button>
            </div>
            <div>
                Last sync: <span title={lastSyncLocalStr}>{lastSyncLocalAgo}</span>
                {#if !$synchronization.lastSyncLocal}
                    <div class="extended" transition:slide|local>
                        <button on:click={upload} aria-busy={isLoading}>
                            Synchronise (upload)
                        </button>
                    </div>
                {/if}
            </div>

            <!-- Ask to download data -->
            {#if $synchronization.lastSync > $synchronization.lastSyncLocal}
                <div class="extended" transition:slide|local={{ delay: 400 }}>
                    There is data from a different device to download
                    <button on:click={download} aria-busy={isLoading}>
                        Synchronise (download)
                    </button>
                </div>
            {/if}

            <!-- Ask to upload data / check for data updates -->
            {#if $synchronization.lastDataChange > $synchronization.lastSyncLocal}
                <div class="extended" transition:slide|local={{ delay: 400 }}>
                    There is unsynchronised data
                    <button on:click={upload} aria-busy={isLoading}>Synchronise (upload)</button>
                </div>
            {:else if $synchronization.lastSync}
                <div transition:slide|local={{ delay: 400 }}>
                    All local data (from this device) is uploaded
                    {#if $synchronization.lastSync <= $synchronization.lastSyncLocal}
                        <div class="extended" transition:slide|local={{ delay: 400 }}>
                            <button
                                on:click={(e) => handleCheck(e, $synchronization.token)}
                                aria-busy={isLoading}
                            >
                                Check for updates
                            </button>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {:else if $nonPersistent.tokenInvalid}
        <div class="main" transition:slide|local>
            Token is invalid
            <button on:click={(e) => handleCheck(e, $synchronization.token)} aria-busy={isLoading}>
                Recheck
            </button>
            <button on:click={handleLogout}>Log out</button>
        </div>
    {:else}
        <div class="main" transition:slide|local>
            In order to synchronise between devices, enter your secret token.<br />
            If you don't have one, click register.<br />
            Without it, your history will still be saved in the browser
            <form class="flex" style="gap: 0" on:submit|preventDefault={handleCheck}>
                <input
                    type="text"
                    class="dark"
                    placeholder="Secret token"
                    bind:value={enteredToken}
                    aria-busy={isLoading}
                />
                <CheckIconButton disabled={isLoading} />
            </form>
            <div>
                <button on:click={handleRegister} aria-busy={isLoading}>Register</button>
            </div>
        </div>
    {/if}

    <ConfirmDialog dialog={confirmDialog} />
    <Popups group="SynchronizationDialog" />
</Dialog>

<style>
    .main {
        width: 400px;
        padding: 2px;
    }

    .main > * {
        display: block;
    }

    .main > *:not(:first-child) {
        margin-top: 8px;
    }

    .flex {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
    }

    .extended {
        padding: 2px;
    }
</style>
