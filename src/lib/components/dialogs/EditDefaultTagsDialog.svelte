<script>
    import Dialog from "../Dialog.svelte";
    import { activities } from "$lib/state";

    export let shown, onClosed, activity;

    let group;
    $: onShownToggled(shown);

    function onApply() {
        activity.defaultTags = group;
        $activities = $activities;
        onClosed();
    }

    function onShownToggled(shown) {
        if (shown) group = [...activity.defaultTags];
    }
</script>

<Dialog {shown} {onClosed}>
    {#each $activities.tags as tag (tag)}
        <label>
            <input type="checkbox" value={tag.name} bind:group />
            {tag.name}
        </label>
    {/each}
    <div class="buttons">
        <button on:click={onApply}>Apply</button>
        <button on:click={onClosed}>Cancel</button>
    </div>
</Dialog>

<style>
    label {
        user-select: none;
        display: block;
    }

    .buttons {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
        gap: 16px;
    }
</style>
