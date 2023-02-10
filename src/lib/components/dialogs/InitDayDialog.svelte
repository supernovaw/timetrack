<script>
    import Dialog from "$lib/components/Dialog.svelte";
    import { timelineLog } from "$lib/state/";
    import formatDuration from "$lib/timeline/durationFormatter";
    import timeline from "$lib/timeline/timeline";
    import popup from "$lib/popups";

    export let shown, onClosed;

    let isTimelineEmpty = true;
    let lastDay = undefined;
    let lastDayEndedAgo;
    let lastDayEndedAgoStr;
    let isSpecifyStartChecked = false;

    $: onShown(shown);
    function onShown(shown) {
        if (!shown) return;
        isTimelineEmpty = $timelineLog.length === 0;
        lastDay = $timelineLog[$timelineLog.length - 1];
        lastDayEndedAgo = lastDay && +new Date() - lastDay.end;
        lastDayEndedAgoStr = lastDay && formatDuration(lastDayEndedAgo);
    }

    $: isConsequentChecked = lastDayEndedAgo < 24 * 3600_000;
    function initDay() {
        if (lastDay && !lastDay.end) return; // just in case
        if (isSpecifyStartChecked) {
            initDayWithStartPicker();
        } else {
            $timelineLog.push({
                start: +new Date(),
                isConsequent:
                    lastDay !== undefined ? isConsequentChecked : false,
                dayLog: [],
            });
            $timelineLog = $timelineLog; // notify subscribers
        }
        shown = false;
    }

    function initDayWithStartPicker() {
        timeline.setTimestampPicker(
            "Select the moment when the day started",
            (pickedTimestamp) => {
                if (pickedTimestamp > +new Date()) {
                    popup("Cannot start a day from a point in the future");
                    return;
                }
                $timelineLog.push({
                    start: pickedTimestamp,
                    isConsequent:
                        lastDay !== undefined ? isConsequentChecked : false,
                    dayLog: [],
                });
                $timelineLog = $timelineLog; // notify subscribers
            }
        );
    }
</script>

<Dialog {shown} {onClosed}>
    {#if isTimelineEmpty}
        This will be the first day on the timeline
    {:else}
        <label>
            <input
                type="checkbox"
                bind:checked={isConsequentChecked}
                disabled={isTimelineEmpty}
            />
            Is consequent? (last day ended {lastDayEndedAgoStr} ago)
        </label>
    {/if}
    <label>
        <input type="checkbox" bind:checked={isSpecifyStartChecked} />
        Specify start (in past)
    </label>
    <button disabled={lastDay && !lastDay.end} on:click={initDay}>
        Initialise
    </button>
</Dialog>

<style>
    label {
        user-select: none;
        display: block;
    }

    button {
        display: block;
        margin-top: 16px;
    }
</style>
