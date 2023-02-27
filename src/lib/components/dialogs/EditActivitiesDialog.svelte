<script>
    import Dialog from "../Dialog.svelte";
    import { activities } from "$lib/state";
    import Popups from "$lib/popups/Popups.svelte";
    import ActivityCard from "../ActivityCard.svelte";
    import { writable } from "svelte/store";
    import { setContext, tick } from "svelte";
    import ConfirmDialog from "./ConfirmDialog.svelte";
    import { slide } from "svelte/transition";
    import { plural } from "$lib/timeline/durationFormatter";
    import CheckIconButton from "../icons/CheckIconButton.svelte";
    import DefaultTagsList from "../TagsList.svelte";

    export let shown, onClosed;

    let confirmDialog = writable();
    setContext("confirmDialog", confirmDialog);

    let newActivityBeingAdded = false;
    let enteredNewActivity = "";
    $: isEnteredNewActivityInvalid = !isActivityNameValid(enteredNewActivity);

    function isActivityNameValid(name) {
        if (name.length < 1) return false;
        if (name.length > 50) return false;
        if (name.at(0) === " ") return false;
        if (name.at(-1) === " ") return false;
        const lowercase = name.toLowerCase();
        if ($activities.list.some(({ name }) => name.toLowerCase() === lowercase)) return false;
        return true;
    }

    async function onNewActivitySubmit(e) {
        if (!newActivityBeingAdded) {
            enteredNewActivity = "";
            newActivityBeingAdded = true;
            await tick();
            e.target.closest(".new-activity").querySelector("input")?.focus();
        } else {
            if (enteredNewActivity === "") return (newActivityBeingAdded = false);
            if (isEnteredNewActivityInvalid) return;
            newActivityBeingAdded = false;
            $activities.list.push({
                name: enteredNewActivity,
                subcategories: [],
                defaultTags: [],
            });
            $activities = $activities;

            // Scroll down after transitioning
            setTimeout(() => {
                const divs = document.querySelectorAll(".activity");
                document.activeElement?.blur();
                divs[divs.length - 1]?.scrollIntoView({ behavior: "smooth" });
            }, 400);
        }
    }
</script>

<Dialog {shown} {onClosed} style="width: 500px">
    {#if $activities.list.length}
        <div transition:slide|local>
            {plural($activities.list.length, "activity", "activities")}:
        </div>
    {/if}
    {#each $activities.list as activity (activity)}
        <ActivityCard {activity} />
    {:else}
        <div transition:slide|local>
            There are no activities yet. Create them here in order to then add them on the timeline.
        </div>
    {/each}
    <div class="new-activity">
        {#if !newActivityBeingAdded}
            <div transition:slide|local>
                <button on:click={onNewActivitySubmit}>Add</button>
            </div>
        {:else}
            <form transition:slide|local on:submit|preventDefault={onNewActivitySubmit}>
                <input
                    type="text"
                    class="dark"
                    bind:value={enteredNewActivity}
                    aria-invalid={isEnteredNewActivityInvalid && enteredNewActivity.length > 0}
                />
                <CheckIconButton
                    disabled={isEnteredNewActivityInvalid && enteredNewActivity.length > 0}
                />
            </form>
        {/if}
    </div>
    <DefaultTagsList style="margin-top: 16px" />

    <Popups group="EditActivitiesDialog" />
</Dialog>

<ConfirmDialog dialog={$confirmDialog} />

<style>
    .new-activity {
        margin-top: 16px;
    }

    .new-activity > * {
        padding: 2px;
        display: flex;
        align-items: center;
    }
</style>
