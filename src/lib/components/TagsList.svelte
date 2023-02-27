<script>
    import { timelineLog, activities } from "$lib/state/";
    import { slide } from "svelte/transition";
    import popup from "$lib/popups";
    import CheckIconButton from "./icons/CheckIconButton.svelte";
    import CrossIconButton from "./icons/CrossIconButton.svelte";
    import EditIconButton from "./icons/EditIconButton.svelte";
    import moment from "moment";
    import { tick } from "svelte";

    export let style = undefined;

    const popupLocal = (msg) => popup(msg, "EditActivitiesDialog");

    let editedTag;
    let editedTagValue = "";
    $: editedTagInvalid = !isTagValid(editedTagValue);

    let newTagBeingAdded = false;
    let enteredNewTag = "";
    $: isEnteredNewTagInvalid = !isTagValid(enteredNewTag);

    function editTag(tag) {
        editedTag = tag;
        editedTagValue = tag?.name || "";
    }

    function editTagSubmit() {
        if (editedTagInvalid) return;

        const oldName = editedTag.name;
        const newName = editedTagValue;
        editedTag.name = newName;
        editTag(undefined);
        const replaceIn = (arr) => {
            const i = arr.indexOf(oldName);
            if (i !== -1) arr[i] = newName;
        };
        $timelineLog.forEach((day) => day.dayLog.forEach((act) => replaceIn(act.tags)));
        $activities.list.forEach((activity) => replaceIn(activity.defaultTags));

        $timelineLog = $timelineLog;
        $activities = $activities;
    }

    function deleteTag(tag) {
        let occurrence;
        $timelineLog.some((day) =>
            day.dayLog.some((act) => {
                if (act.tags.includes(tag.name)) {
                    occurrence = act;
                    return true;
                }
            })
        );
        if (occurrence) {
            const t = moment(occurrence.start).format("YYYY MMM DD HH:mm");
            popupLocal(
                `The tag "${tag.name}" cannot be removed because it ` +
                    `is present on the timeline (first occurrence: ${t})`
            );
            return;
        }
        let dependencies = $activities.list
            .filter((activity) => activity.defaultTags.includes(tag.name))
            .map((t) => t.name);
        if (dependencies.length > 0) {
            popupLocal(
                `The tag "${tag.name}" cannot be removed because it ` +
                    `is a default tag for ${dependencies.join(", ")}`
            );
            return;
        }
        $activities.tags = $activities.tags.filter(({ name }) => name !== tag.name);
    }

    function isTagValid(enteredTag) {
        if (enteredTag.length < 1) return false;
        if (enteredTag.length > 50) return false;
        if (enteredTag.at(0) === " ") return false;
        if (enteredTag.at(-1) === " ") return false;
        const lowercase = enteredTag.toLowerCase();
        if (lowercase === editedTag?.name.toLowerCase()) return true; // allow collision with the edited tag
        if ($activities.tags.some(({ name }) => name.toLowerCase() === lowercase)) return false;
        return true;
    }

    async function onNewTagSubmit() {
        if (!newTagBeingAdded) {
            resetEditing("new-tag-name");
            enteredNewTag = "";
            newTagBeingAdded = true;
        } else {
            if (enteredNewTag === "") return (newTagBeingAdded = false);
            if (isEnteredNewTagInvalid) return;
            newTagBeingAdded = false;
            $activities.tags.push({ name: enteredNewTag });
            $activities = $activities;

            // Scroll down after transitioning
            setTimeout(() => {
                const div = document.querySelector(".new-tag");
                document.activeElement?.blur();
                div?.scrollIntoView({ behavior: "smooth" });
            }, 400);
        }
    }

    function resetEditing(idToFocus) {
        editTag(undefined);
        newTagBeingAdded = false;
        if (idToFocus)
            tick().then(() => document.querySelector(`.tags-list input#${idToFocus}`)?.focus());
    }
</script>

<div class="tags-list" {style}>
    {#if $activities.tags.length > 0}
        <div style="margin-bottom: 4px">
            Tags ({$activities.tags.length}):
        </div>
    {/if}
    {#each $activities.tags as tag, i (tag)}
        <div transition:slide|local>
            {#if tag !== editedTag}
                <div class="tag" transition:slide|local>
                    <div style="margin-inline-end: 8px; word-break: break-all">{tag.name}</div>
                    <EditIconButton
                        onclick={() => {
                            resetEditing(`tag-name-${i}`);
                            editTag(tag);
                        }}
                    />
                    <CrossIconButton onclick={() => deleteTag(tag)} />
                </div>
            {:else}
                <form
                    class="tag extended"
                    transition:slide|local
                    on:submit|preventDefault={editTagSubmit}
                >
                    <div style="width: 200px">
                        <input
                            type="text"
                            id="tag-name-{i}"
                            class="dark"
                            style="width: 100%"
                            bind:value={editedTagValue}
                            aria-invalid={editedTagInvalid}
                        />
                    </div>
                    <CheckIconButton />
                </form>
            {/if}
        </div>
    {:else}
        <div>No tags added</div>
    {/each}
    <div class="new-tag">
        {#if !newTagBeingAdded}
            <div transition:slide|local>
                <button on:click={onNewTagSubmit}>Add</button>
            </div>
        {:else}
            <form transition:slide|local on:submit|preventDefault={onNewTagSubmit}>
                <input
                    type="text"
                    id="new-tag-name"
                    class="dark"
                    bind:value={enteredNewTag}
                    aria-invalid={isEnteredNewTagInvalid && enteredNewTag.length > 0}
                />
                <CheckIconButton disabled={isEnteredNewTagInvalid && enteredNewTag.length > 0} />
            </form>
        {/if}
    </div>
</div>

<style>
    .tag {
        display: flex;
        align-items: center;
        padding-inline-start: 24px;
    }

    .tag.extended {
        padding-inline-start: 24px;
    }

    .tag :global(.icon-button) {
        opacity: 0;
    }

    .tag:hover :global(.icon-button),
    .tag :global(.icon-button):focus-visible {
        opacity: 1;
    }

    /* This is so that when transition:slide is in progress, input's outline is shown properly */
    .extended {
        margin: -2px;
        padding: 2px;
    }

    .new-tag {
        margin-top: 4px;
    }

    .new-tag > * {
        padding: 2px;
        display: flex;
        align-items: center;
    }
</style>
