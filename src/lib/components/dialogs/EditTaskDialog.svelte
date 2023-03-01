<script>
    import { slide } from "svelte/transition";
    import { timelineLog, activities } from "$lib/state";
    import Dialog from "../Dialog.svelte";

    export let shown, onClosed, task;

    $: onShownToggled(shown);

    let selectedActivity;
    let selectedSubcategory;
    let selectedTags = [];
    let description = "";

    function onShownToggled(shown) {
        if (shown) {
            selectedActivity = $activities.list.find((a) => a.name === task.activityName);
            selectedSubcategory = task.activitySubcategory;
            selectedTags = [...task.tags];
            description = task.description;
        }
    }

    function selectActivity(activity) {
        if (selectedActivity !== activity) selectedActivity = activity;
        selectedSubcategory = undefined;
    }

    function handleApply() {
        task.activityName = selectedActivity.name;
        task.activitySubcategory = selectedSubcategory || "";
        task.tags = [...selectedTags];
        task.description = description;
        $timelineLog = $timelineLog;
        onClosed();
    }
</script>

<Dialog {shown} {onClosed}>
    <div>Select activity:</div>
    <div class="activities">
        {#each $activities.list as activity (activity)}
            <button
                class:selected={activity === selectedActivity}
                on:click={() => selectActivity(activity)}
            >
                {activity.name}
            </button>
        {/each}
    </div>

    {#if selectedActivity.subcategories.length > 0}
        <div transition:slide|local style="margin-top: 16px">Select subcategory:</div>
    {/if}
    {#key selectedActivity}
        <div class="subcategories" transition:slide|local>
            {#each selectedActivity.subcategories as subcategory (subcategory)}
                <button
                    class:selected={selectedSubcategory === subcategory}
                    on:click={() => (selectedSubcategory = subcategory)}
                >
                    {subcategory}
                </button>
            {/each}
        </div>
    {/key}

    <div class="tags">
        <div>Select tags:</div>
        {#each $activities.tags as tag}
            <label class:selected={selectedTags.includes(tag.name)}>
                <input type="checkbox" value={tag.name} bind:group={selectedTags} />
                <span>{tag.name}</span>
            </label>
        {:else}
            there are no tags created yet
        {/each}
    </div>

    <div style="margin-top: 16px">
        <input
            style="width: 100%"
            placeholder="Description…"
            class="dark"
            type="text"
            bind:value={description}
        />
    </div>

    <div class="bottom-buttons">
        <button on:click={handleApply}>Apply</button>
        <button on:click={onClosed}>Cancel</button>
    </div>
</Dialog>

<style>
    .activities button,
    .subcategories button {
        margin: 4px;
    }

    button.selected {
        background-color: #333;
        outline-color: #777;
    }

    .tags {
        margin-top: 16px;
    }

    label {
        display: inline-block;
        padding: 4px;
        cursor: pointer;
    }

    label span {
        color: #888;
        transition: 0.1s ease-out;
        text-decoration: underline transparent;
    }

    label.selected span {
        color: white;
        text-decoration-color: white;
    }

    .bottom-buttons {
        margin-top: 16px;
        padding: 2px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    div,
    label {
        user-select: none;
    }
</style>
