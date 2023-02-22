<script>
    import Dialog from "../Dialog.svelte";

    export let dialog; // undefined | { text: string, yesHandler: e => void, hidden?: boolean }

    function handle(yes) {
        dialog.hidden = true;
        if (yes) dialog.yesHandler();
    }
</script>

<Dialog shown={dialog && !dialog.hidden} onClosed={() => (dialog.hidden = true)}>
    <div class="text">{dialog.text}</div>
    <div class="buttons">
        <button on:click={() => handle(true)}>Yes</button>
        <button on:click={() => handle(false)}>No</button>
    </div>
</Dialog>

<style>
    .text {
        text-align: center;
        user-select: none;
    }

    .buttons {
        margin-top: 16px;
        display: flex;
        justify-content: space-around;
    }
</style>
