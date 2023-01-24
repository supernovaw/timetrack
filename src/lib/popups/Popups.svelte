<script>
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import { store } from ".";

    function remove(popup) {
        $store = $store.filter((p) => p.id !== popup.id);
    }

    function preventDisappearing(popup) {
        if (popup.disappearPrevented) return;
        popup.disappearPrevented = true;
        $store = $store;
    }
</script>

<div class="popups-container">
    {#each $store as popup (popup.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="popup"
            class:disappearing={!popup.disappearPrevented}
            on:click={() => remove(popup)}
            on:mouseenter={() => preventDisappearing(popup)}
            in:fly={{ y: -115, duration: 300 }}
            out:fly={{ x: 200, duration: 500 }}
            animate:flip={{ duration: 300 }}
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

    .popup {
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

    @keyframes expire {
        from { translate: 0% 0 }
        to { translate: 50% 0 }
    }
</style>
