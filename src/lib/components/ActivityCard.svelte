<script>
    import moment from "moment";
    import { getContext, tick } from "svelte";
    import { slide } from "svelte/transition";
    import { activities } from "$lib/state";
    import popup from "$lib/popups";
    import CrossIconButton from "./icons/CrossIconButton.svelte";
    import EditIconButton from "./icons/EditIconButton.svelte";
    import CheckIconButton from "./icons/CheckIconButton.svelte";
    import { timelineLog } from "$lib/state";
    import EditDefaultTagsDialog from "./dialogs/EditDefaultTagsDialog.svelte";

    export let activity;

    const confirmDialog = getContext("confirmDialog");
    const popupLocal = (msg) => popup(msg, "EditActivitiesDialog");

    let isNameBeingEdited = false;
    let enteredName = "";
    $: isEnteredNameInvalid = !isActivityNameValid(enteredName);

    let editedSubcategoryName = undefined;
    let enteredSubcategoryName = "";
    $: isEnteredSubcatagoryInvalid = !isSubcategoryNameValid(enteredSubcategoryName);

    let newSubcategoryBeingAdded = false;
    let enteredNewSubcategory = "";
    $: isEnteredNewSubcategoryInvalid = !isSubcategoryNameValid(enteredNewSubcategory);

    let showEditTagsDialog = false;

    function resetEditing(idToFocus) {
        isNameBeingEdited = false;
        editedSubcategoryName = undefined;
        newSubcategoryBeingAdded = false;
        if (idToFocus)
            tick().then(() => document.querySelector(`.activity input#${idToFocus}`)?.focus());
    }

    function isActivityNameValid(name) {
        if (name.length < 1) return false;
        if (name.length > 50) return false;
        if (name.at(0) === " ") return false;
        if (name.at(-1) === " ") return false;
        if ($activities.list.some(nameCollides)) return false;
        return true;
    }

    // Determines whether the entered name collides with a given activity's name
    function nameCollides(withActivity) {
        if (withActivity === activity) return false;
        return withActivity.name.toLowerCase() === enteredName.toLowerCase();
    }

    function isSubcategoryNameValid(name) {
        if (name === editedSubcategoryName) return true;
        if (name.length < 1) return false;
        if (name.length > 50) return false;
        if (name.at(0) === " ") return false;
        if (name.at(-1) === " ") return false;
        const collision = activity.subcategories.some(
            (sc) => sc.toLowerCase() === name.toLowerCase()
        );
        if (collision) return false;
        return true;
    }

    function onDeleteClicked() {
        let occurrence;
        $timelineLog.some((day) =>
            day.dayLog.some((act) => {
                if (act.activityName === activity.name) {
                    occurrence = act;
                    return true;
                }
            })
        );
        if (occurrence !== undefined) {
            const t = moment(occurrence.start).format("YYYY MMM DD HH:mm");
            return popupLocal(
                `The activity "${activity.name}" cannot be removed because ` +
                    `it is present on the timeline (first occurrence: ${t})`
            );
        }
        $confirmDialog = {
            text: `Confirm removing "${activity.name}"`,
            yesHandler: () => {
                $activities.list = $activities.list.filter((a) => a !== activity);
            },
        };
    }

    function onDeleteSubcategoryClicked(subcategory) {
        let occurrence;
        $timelineLog.some((day) =>
            day.dayLog.some((act) => {
                if (act.activitySubcategory === subcategory) {
                    occurrence = act;
                    return true;
                }
            })
        );
        if (occurrence !== undefined) {
            const t = moment(occurrence.start).format("YYYY MMM DD HH:mm");
            return popupLocal(
                `The subcategory "${subcategory}" cannot be removed because ` +
                    `it is present on the timeline (first occurrence: ${t})`
            );
        }
        $confirmDialog = {
            text: `Confirm removing "${subcategory}" from "${activity.name}"`,
            yesHandler: () => {
                activity.subcategories = activity.subcategories.filter((sc) => sc !== subcategory);
                $activities = $activities;
            },
        };
    }

    function onActivityNameChanged() {
        if (isEnteredNameInvalid) return;
        isNameBeingEdited = false;
        const oldName = activity.name;
        activity.name = enteredName;
        $timelineLog.forEach((day) =>
            day.dayLog.forEach((act) => {
                if (act.activityName === oldName) act.activityName = enteredName;
            })
        );
        $activities = $activities;
        $timelineLog = $timelineLog;
    }

    function onSubcategoryNameChanged() {
        if (!isSubcategoryNameValid) return;
        const oldName = editedSubcategoryName;
        const newName = enteredSubcategoryName;
        activity.subcategories[activity.subcategories.indexOf(oldName)] = newName;
        editedSubcategoryName = undefined;
        $timelineLog.forEach((day) =>
            day.dayLog.forEach((act) => {
                if (act.activitySubcategory === oldName) act.activitySubcategory = newName;
            })
        );
        $activities = $activities;
        $timelineLog = $timelineLog;
    }

    function onNewCategorySubmit() {
        if (newSubcategoryBeingAdded) {
            if (enteredNewSubcategory === "") {
                newSubcategoryBeingAdded = false;
                return;
            }
            if (isEnteredNewSubcategoryInvalid) return;
            activity.subcategories.push(enteredNewSubcategory);
            $activities = $activities;
            newSubcategoryBeingAdded = false;
        } else {
            resetEditing("new-subcategory-name");
            enteredNewSubcategory = "";
            newSubcategoryBeingAdded = true;
        }
    }
</script>

<div class="activity" transition:slide|local>
    {#if !isNameBeingEdited}
        <div class="name" transition:slide|local>
            <i>{activity.name}</i>
            <EditIconButton
                onclick={() => {
                    resetEditing("activity-name");
                    isNameBeingEdited = true;
                    enteredName = activity.name;
                }}
            />
        </div>
    {:else}
        <form
            class="name-editing"
            transition:slide|local
            on:submit|preventDefault={onActivityNameChanged}
        >
            <input
                type="text"
                id="activity-name"
                bind:value={enteredName}
                aria-invalid={isEnteredNameInvalid}
            />
            <CheckIconButton disabled={isEnteredNameInvalid} />
        </form>
    {/if}
    <CrossIconButton onclick={onDeleteClicked} />
    <div class="subcategories">
        {#if activity.subcategories.length === 0}
            Subcategories: none
        {:else}
            Subcategories ({activity.subcategories.length}):
        {/if}
        {#each activity.subcategories as subcategory, i (subcategory)}
            <div transition:slide|local>
                {#if editedSubcategoryName !== subcategory}
                    <div class="subcategory" transition:slide|local>
                        <div style="margin-inline-end: 8px; word-break: break-all">
                            {subcategory}
                        </div>
                        <EditIconButton
                            onclick={() => {
                                resetEditing("subcategory-name-" + i);
                                editedSubcategoryName = subcategory;
                                enteredSubcategoryName = subcategory;
                            }}
                        />
                        <CrossIconButton onclick={() => onDeleteSubcategoryClicked(subcategory)} />
                    </div>
                {:else}
                    <form
                        class="subcategory extended"
                        transition:slide|local
                        on:submit|preventDefault={onSubcategoryNameChanged}
                    >
                        <div style="width: 200px">
                            <input
                                type="text"
                                id="subcategory-name-{i}"
                                bind:value={enteredSubcategoryName}
                                aria-invalid={isEnteredSubcatagoryInvalid}
                            />
                        </div>
                        <CheckIconButton disabled={isEnteredSubcatagoryInvalid} />
                    </form>
                {/if}
            </div>
        {/each}
        <form class="new-subcategory" on:submit|preventDefault={onNewCategorySubmit}>
            {#if !newSubcategoryBeingAdded}
                <div transition:slide|local style="padding: 2px">
                    <button class="light" style="display: block">New</button>
                </div>
            {:else}
                <div transition:slide|local style="padding: 2px">
                    <div style="display: flex">
                        <div style="width: 200px">
                            <input
                                placeholder="New subcategory…"
                                type="text"
                                id="new-subcategory-name"
                                bind:value={enteredNewSubcategory}
                                aria-invalid={isEnteredNewSubcategoryInvalid &&
                                    enteredNewSubcategory.length > 0}
                            />
                        </div>
                        <CheckIconButton
                            disabled={isEnteredNewSubcategoryInvalid &&
                                enteredNewSubcategory.length > 0}
                        />
                    </div>
                </div>
            {/if}
        </form>
    </div>
    <div class="default-tags">
        <div style="flex: 1; padding-top: 6px">
            Default tags:
            {activity.defaultTags.length === 0 ? "none" : activity.defaultTags.join(", ")}
        </div>
        <EditIconButton onclick={() => (showEditTagsDialog = true)} />
    </div>
</div>

<EditDefaultTagsDialog
    {activity}
    shown={showEditTagsDialog}
    onClosed={() => (showEditTagsDialog = false)}
/>

<style>
    .activity {
        margin-top: 16px;
        background-color: #07070755;
        box-shadow: 0 1px 10px #111a;
        border-radius: 3px;
        padding: 10px 20px 15px 20px;
        position: relative;
        transition: box-shadow 70ms ease-out;
    }

    .activity:hover {
        box-shadow: 0 1px 10px #0e0e0e;
    }

    .activity .name {
        text-align: center;
        padding: 8px 44px 9px 44px;
        text-transform: capitalize;
        cursor: default;
        user-select: none;
    }

    .activity .name-editing {
        padding: 2px 44px;
        max-width: 200px;
        margin: auto;
        position: relative;
        display: block;
        text-align: center;
    }

    input {
        width: 100%;
    }

    /* This is so that when transition:slide is in progress, input's outline is shown properly */
    .extended {
        margin: -2px;
        padding: 2px;
    }

    .activity :global(.icon-button) {
        position: absolute;
    }

    .activity .name :global(.EditIconButton) {
        transform: translateY(-0.5em);
        opacity: 0;
    }

    .activity .name:hover :global(.EditIconButton),
    .activity .name :global(.EditIconButton):focus-visible {
        opacity: 1;
    }

    .activity > :global(.CrossIconButton) {
        top: 0;
        right: 0;
    }

    :global(:root[dir="rtl"]) .activity > :global(.CrossIconButton) {
        right: unset;
        left: 0;
    }

    .subcategories {
        display: flex;
        flex-direction: column;
    }

    .subcategories :global(.icon-button) {
        position: static;
    }

    .subcategory {
        display: flex;
        align-items: center;
        padding-inline-start: 24px;
    }

    .subcategory :global(.icon-button) {
        opacity: 0;
    }

    .subcategory:hover :global(.icon-button),
    .subcategory :global(.icon-button):focus-visible {
        opacity: 1;
    }

    .new-subcategory {
        margin-top: 4px;
    }

    .default-tags {
        margin-top: 8px;
        display: flex;
        align-items: flex-start;
    }

    .default-tags :global(.icon-button) {
        position: static;
    }
</style>
