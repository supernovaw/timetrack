<script>
    import { tick } from "svelte";

    export let shown, onClosed;
    export let style = undefined;

    let dialogEl;
    let classShown = shown; // CSS class that causes the fade transition
    let isFadingOut = false;

    $: typeof window !== "undefined" && onShownToggled(shown);

    const getTopmostDialog = () =>
        document.elementsFromPoint(0, 0).find((el) => el.tagName === "DIALOG");
    const getComputedOpacity = () => window.getComputedStyle(dialogEl).opacity;

    async function onShownToggled() {
        await tick();
        if (shown) {
            dialogEl.showModal();
            classShown = true;
        } else {
            if (dialogEl) startFadingOut();
        }
    }

    function startFadingOut() {
        isFadingOut = true;
        classShown = false;
        if (getComputedOpacity() == 0) {
            // Edge case. onFadeOut will never run on its own, just close immediately
            onFadedOut();
        }
    }

    function onFadedOut() {
        isFadingOut = false;
        onClosed();
    }

    // When clicking on the backdrop, close dialog
    function onDialogClick(e) {
        const fracX = e.offsetX / e.target.offsetWidth;
        const fracY = e.offsetY / e.target.offsetHeight;
        const outOfBounds = fracX < 0 || fracY < 0 || fracX > 1 || fracY > 1;
        if (outOfBounds) startFadingOut();
    }

    function onTransitionEnd(e) {
        if (e.pseudoElement !== "") return;
        if (e.propertyName !== "opacity") return;
        if (getComputedOpacity() != 0) return;
        onFadedOut();
    }

    // Override default Escape behaviour (fade out instead of abruptly closing)
    function onKeyDown(e) {
        if (shown && e.code === "Escape") {
            e.preventDefault();
            if (dialogEl === getTopmostDialog()) startFadingOut();
        }
    }
</script>

{#if shown || classShown || isFadingOut}
    <dialog
        bind:this={dialogEl}
        class:shown={classShown}
        on:mousedown|self={onDialogClick}
        on:transitionend|self={onTransitionEnd}
        {style}
    >
        <slot />
    </dialog>
{/if}
<svelte:body on:keydown={onKeyDown} />

<style>
    dialog::backdrop {
        opacity: 0;
        background: #0008;
        transition: 0.1s ease;
    }

    dialog.shown::backdrop {
        opacity: 1;
    }

    dialog {
        background-color: #222a;
        box-shadow: 0 2px 8px black;
        color: inherit;
        min-width: min(80%, 300px);
        max-width: min(80%, 1000px);
        max-height: 60%;
        padding: 32px;
        box-sizing: border-box;
        border: none;
        border-radius: 16px;
        overflow: auto;
        transition: 0.1s ease;
        opacity: 0;
    }

    dialog.shown {
        opacity: 1;
    }

    /* Customise the scrollbar (Chromium) */
    dialog::-webkit-scrollbar-thumb {
        background-color: #444;
        border: 12px solid transparent;
        border-radius: 16px;
        background-clip: padding-box;
    }

    dialog::-webkit-scrollbar-thumb:hover {
        background-color: #555;
    }

    dialog::-webkit-scrollbar {
        width: 32px;
        background-color: transparent;
    }
</style>
