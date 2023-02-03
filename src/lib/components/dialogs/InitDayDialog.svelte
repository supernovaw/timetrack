<script>
    import Dialog from "$lib/components/Dialog.svelte";
    import { timelineLog } from "$lib/state/";
    import formatDuration from "$lib/timeline/durationFormatter";

    export let shown, onClosed;

    let isTimelineEmpty = true;
    let lastDay = undefined;
    let lastDayEndedAgo;
    let lastDayEndedAgoStr;

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

        $timelineLog.push({
            start: +new Date(),
            isConsequent: lastDay !== undefined ? isConsequentChecked : false,
            dayLog: [],
        });
        $timelineLog = $timelineLog; // notify subscribers
        shown = false;
    }
</script>

<Dialog {shown} {onClosed}>
    {#if isTimelineEmpty}
        This will be the first day on the timeline
    {:else}
        <label for="is-consequent" disabled={isTimelineEmpty}>
            <input
                id="is-consequent"
                type="checkbox"
                bind:checked={isConsequentChecked}
                disabled={isTimelineEmpty}
            />
            Is consequent? (last day ended {lastDayEndedAgoStr} ago)
        </label>
    {/if}
    <button disabled={lastDay && !lastDay.end} on:click={initDay}>
        Initialise
    </button>
</Dialog>

<style>
    label {
        user-select: none;
    }

    button {
        display: block;
        margin-top: 16px;
    }
</style>
