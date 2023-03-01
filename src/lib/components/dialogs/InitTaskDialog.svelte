<script>
    import { slide } from "svelte/transition";
    import { timelineLog, activities } from "$lib/state";
    import Popups from "$lib/popups/Popups.svelte";
    import Dialog from "../Dialog.svelte";
    import popup from "$lib/popups";
    import timeline from "$lib/timeline/timeline";

    export let shown, onClosed;
    export let predefinedTime = undefined;

    $: onShownToggled(shown);
    $: lastDay = $timelineLog.at(-1);

    const popupLocal = (msg) => popup(msg, "InitTaskDialog");

    let preventAutoTagAssignment = false;
    const onTagChecked = () => (preventAutoTagAssignment = true);

    let selectedActivity;
    let selectedSubcategory;
    let selectedTags = [];
    let description = "";

    function onShownToggled(shown) {
        if (shown) {
            selectedActivity = undefined;
            selectedSubcategory = undefined;
            selectedTags = [];
            description = "";
            preventAutoTagAssignment = false;
        }
    }

    function selectActivity(activity) {
        if (selectedActivity !== activity) selectedActivity = activity;
        selectedSubcategory = undefined;
        if (!preventAutoTagAssignment || selectedTags.length === 0)
            selectedTags = [...activity.defaultTags];
    }

    function handleStart() {
        if (!selectedActivity) return popupLocal("Select an activity first");

        onClosed();
        lastDay.dayLog.push({
            activityName: selectedActivity.name,
            activitySubcategory: selectedSubcategory || "",
            description,
            tags: [...selectedTags],
            start: +new Date(),
        });
        $timelineLog = $timelineLog;
    }

    function handleStartFromPast() {
        if (!selectedActivity) return popupLocal("Select an activity first");

        onClosed();
        timeline.setTimestampPicker("Select task start", (timestamp) => {
            if (timestamp > +new Date()) {
                return popup("Please select a point in past");
            }
            if (timestamp < lastDay.start) {
                return popup("Cannot start a task before the day's start");
            }
            const lastTask = lastDay.dayLog.at(-1);
            if (lastTask && timestamp < lastTask.end) {
                return popup("Cannot start a task before the previous one's end");
            }

            lastDay.dayLog.push({
                activityName: selectedActivity.name,
                activitySubcategory: selectedSubcategory || "",
                description,
                tags: [...selectedTags],
                start: timestamp,
            });
            $timelineLog = $timelineLog;
        });
    }

    function handleInsert() {
        if (!selectedActivity) return popupLocal("Select an activity first");

        onClosed();
        lastDay.dayLog.push({
            activityName: selectedActivity.name,
            activitySubcategory: selectedSubcategory || "",
            description,
            tags: [...selectedTags],
            start: predefinedTime.start,
            end: predefinedTime.end,
        });
        lastDay.dayLog.sort((a, b) => a.start - b.start);
        $timelineLog = $timelineLog;
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

    {#if selectedActivity && selectedActivity.subcategories.length > 0}
        <div transition:slide|local style="margin-top: 16px">Select subcategory:</div>
    {/if}
    {#key selectedActivity}
        <div class="subcategories" transition:slide|local>
            {#each selectedActivity?.subcategories || [] as subcategory (subcategory)}
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
                <input
                    type="checkbox"
                    value={tag.name}
                    bind:group={selectedTags}
                    on:change={onTagChecked}
                />
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
        {#if !predefinedTime}
            <button on:click={handleStart}>Start</button>
            <button on:click={handleStartFromPast}>Start (from past)</button>
        {:else}
            <button on:click={handleInsert}>Insert</button>
        {/if}
    </div>

    <Popups group="InitTaskDialog" />
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
