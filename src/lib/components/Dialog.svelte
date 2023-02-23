<script>
    import { tick } from "svelte";

    export let shown, onClosed;
    export let style = undefined;

    $: externalShown = shown; // this one reflects desired state from outside
    let internalShown = shown; // same, but becomes false after fully fading out
    let dialogElement;

    const isBrowser = typeof window !== "undefined";
    $: isBrowser && onShownToggled(shown);

    async function onShownToggled() {
        await tick();
        if (externalShown) {
            internalShown = true;
            dialogElement.showModal();
        }
    }

    // Same as the parent asking us to close
    function closeWithTransition() {
        externalShown = false;
    }

    // When clicking on the backdrop, close dialog
    function onDialogClick(e) {
        const fracX = e.offsetX / e.target.offsetWidth;
        const fracY = e.offsetY / e.target.offsetHeight;
        const outOfBounds = fracX < 0 || fracY < 0 || fracX > 1 || fracY > 1;
        if (outOfBounds) closeWithTransition();
    }

    // After the dialog finished fading out, run onClosed()
    function onTransitionEnd(e) {
        if (e.target !== dialogElement) return;
        if (e.propertyName !== "opacity" || e.pseudoElement !== "") return;
        const { opacity } = window.getComputedStyle(e.target);
        if (opacity == 0) {
            internalShown = false;
            dialogElement.close();
            onClosed();
        }
    }

    const getTopmostDialog = () =>
        document.elementsFromPoint(0, 0).find((el) => el.tagName === "DIALOG");

    // Override default Escape behaviour (fade out instead of abruptly closing)
    function onKeyDown(e) {
        if (!shown || e.code !== "Escape") return;
        e.preventDefault();
        if (dialogElement !== getTopmostDialog()) return;
        closeWithTransition();
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
    bind:this={dialogElement}
    class:shown={externalShown}
    on:mousedown|self={onDialogClick}
    on:transitionend={onTransitionEnd}
    {style}
>
    {#if internalShown}<slot />{/if}
</dialog>
<svelte:body on:keydown={onKeyDown} />

<style>
    dialog::backdrop {
        opacity: 0;
        background: #0004;
        backdrop-filter: blur(7px);
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
