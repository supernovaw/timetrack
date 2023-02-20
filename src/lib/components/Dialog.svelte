<script>
    import { onMount, tick } from "svelte";
    export let shown, onClosed;

    $: externalShown = shown; // this one reflects desired state from outside
    let internalShown = shown; // same, but becomes false after fully fading out
    let dialogElement;

    const isBrowser = typeof window !== "undefined";
    $: isBrowser && onShownToggled(shown);

    function onShownToggled() {
        if (externalShown) {
            internalShown = true;
            if (dialogElement === undefined) {
                tick().then(() => dialogElement.showModal());
            } else {
                dialogElement.showModal();
            }
        }
    }

    // Same as the parent asking us to close
    function closeWithTransition() {
        externalShown = false;
    }

    // When clicking on the backdrop, close dialog
    function onDialogClick(e) {
        const fracX = e.offsetX / e.target.clientWidth;
        const fracY = e.offsetY / e.target.clientHeight;
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

    // Override default Escape behaviour (fade out instead of abruptly closing)
    onMount(() => {
        function onKeyDown(e) {
            if (!shown || e.code !== "Escape") return;
            e.preventDefault();
            closeWithTransition();
        }
        document.body.addEventListener("keydown", onKeyDown);
        return () => document.body.removeEventListener("keydown", onKeyDown);
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
    bind:this={dialogElement}
    class:shown={externalShown}
    on:click|self={onDialogClick}
    on:transitionend={onTransitionEnd}
>
    {#if internalShown}<slot />{/if}
</dialog>

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
