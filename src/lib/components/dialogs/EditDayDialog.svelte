<script>
    import Dialog from "$lib/components/Dialog.svelte";
    import Popups from "$lib/popups/Popups.svelte";
    import timeline from "$lib/timeline/timeline";
    import popup from "$lib/popups";
    import moment from "moment";
    import { timelineLog } from "$lib/state";
    import formatDuration from "$lib/timeline/durationFormatter";
    import ConfirmDialog from "./ConfirmDialog.svelte";

    export let shown, onClosed, dayIndex;

    $: day = $timelineLog[dayIndex] || day;
    $: dayEnded = !!day?.end;

    let confirmDialog;
    const popupLocal = (msg) => popup(msg, "EditDayDialog");

    function finishDay() {
        const lastTask = day.dayLog.at(-1);
        if (lastTask && !lastTask.end) {
            popupLocal("Cannot end day with an unfinished task");
            return;
        }

        shown = false;
        timeline.setTimestampPicker("Select the day's ending time", (pickedTimestamp) => {
            const now = +new Date();
            if (pickedTimestamp > now) {
                popup("Please select a point in past");
                return;
            }
            if (pickedTimestamp < day.start) {
                popup("The day cannot end before it started");
                return;
            }
            if (lastTask && pickedTimestamp < lastTask.end) {
                popup("Cannot end day before a task's end");
                return;
            }
            day.end = pickedTimestamp;
            $timelineLog = $timelineLog;
        });
    }

    function removeDay() {
        const startedAgo = formatDuration(+new Date() - day.start);
        confirmDialog = {
            text: `Confirm removing this day (started: ${startedAgo} ago)`,
            yesHandler: () => {
                shown = false;
                $timelineLog.splice(dayIndex, 1);
                $timelineLog = $timelineLog;
            },
        };
    }

    function toggleConsequent() {
        day.isConsequent = !day.isConsequent;
        $timelineLog = $timelineLog;
    }
</script>

<Dialog {shown} {onClosed}>
    {#if dayEnded}
        <div>Day #{dayIndex + 1}</div>
        <div>
            {moment(day.start).format("YYYY-MM-DD HH:mm")} ???
            {moment(day.end).format("YYYY-MM-DD HH:mm")}
        </div>
        <div class="control-buttons">
            <button on:click={removeDay}>Remove</button>
        </div>
    {:else}
        <div>Day #{dayIndex + 1} (ongoing)</div>
        <div>
            Started {moment(day.start).format("HH:mm")}
            ({formatDuration(+new Date() - day.start)} ago)
        </div>
        <div class="control-buttons">
            <button on:click={finishDay}>Finish (select time)</button>
            <button on:click={removeDay}>Remove</button>
        </div>
    {/if}
    {#if dayIndex > 0}
        <div style="display: flex; justify-content: space-between; align-items: center">
            <div>{day.isConsequent ? "Consequent: yes" : "Consequent: no"}</div>
            <button on:click={toggleConsequent}>Toggle</button>
        </div>
    {/if}

    <Popups group="EditDayDialog" />
</Dialog>

<ConfirmDialog dialog={confirmDialog} />

<style>
    :global(dialog) > div:not(:first-child) {
        margin-top: 10px;
    }
</style>
