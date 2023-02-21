<script>
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import { store } from ".";

    // For popups to be displayed in <Dialog>s, they need to be in a separate group
    export let group = "default";
    $: popups = $store.filter((p) => p.group === group);

    function remove(popup) {
        $store = $store.filter((p) => p.id !== popup.id);
    }

    function preventDisappearing(popup) {
        if (popup.disappearPrevented) return;
        popup.disappearPrevented = true;
        $store = $store;
    }

    const rtl = () => (typeof window !== "undefined" ? document.dir === "rtl" : false);
</script>

<div class="popups-container">
    {#each popups as popup (popup.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="popup"
            class:disappearing={!popup.disappearPrevented}
            on:click={() => remove(popup)}
            on:mouseenter={() => preventDisappearing(popup)}
            in:fly|local={{ y: -115, duration: 300 }}
            out:fly|local={{ x: rtl() ? -200 : 200, duration: 500 }}
            animate:flip|local={{ duration: 300 }}
        >
            {popup.text}
        </div>
    {/each}
</div>

<style>
    .popups-container {
        position: fixed;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        pointer-events: none;
    }

    :global(:root[dir="rtl"]) .popups-container {
        right: unset;
        left: 0;
    }

    .popup {
        max-width: min(calc(100vw - 128px), 500px);
        margin-top: 32px;
        margin-inline-end: 32px;
        padding: 32px;
        background-color: #3334;
        border-radius: 8px;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 10px #0a0a0a;
        pointer-events: all;
        cursor: pointer;
        user-select: none;
    }

    .popup::after {
        opacity: 0;
        transition: opacity 0.5s ease-in;
        background: linear-gradient(to right, transparent 0%, #fff 100%);
        animation: expire 5s linear; /* duration has to match setTimeout */
        translate: 50% 0;
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: 200%;
        z-index: -1;
    }

    .popup.disappearing::after {
        opacity: 0.15;
    }

    :global(:root[dir="rtl"]) .popup::after {
        background: linear-gradient(to left, transparent 0%, #fff 100%);
        animation: expire-rtl 5s linear; /* duration has to match setTimeout */
        translate: 50% 0;
        right: unset;
        left: 0;
    }

    @keyframes expire {
        from { translate: 0% 0 }
        to { translate: 50% 0 }
    }

    @keyframes expire-rtl {
        from { translate: 0% 0 }
        to { translate: -50% 0 }
    }
</style>
