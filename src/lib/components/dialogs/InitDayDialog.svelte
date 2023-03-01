<script>
    import Dialog from "$lib/components/Dialog.svelte";
    import { timelineLog } from "$lib/state/";
    import formatDuration from "$lib/timeline/durationFormatter";
    import timeline from "$lib/timeline/timeline";
    import popup from "$lib/popups";

    export let shown, onClosed;
    export let predefinedTime = undefined;

    let previousDay = undefined;
    let previousDayEndedAgo;
    let previousDayEndedAgoStr;
    let isSpecifyStartChecked = false;

    $: onShown(shown);
    function onShown(shown) {
        if (!shown) return;
        previousDay = getPreviousDay();
        previousDayEndedAgo = predefinedTime
            ? previousDay && predefinedTime.start - previousDay.end
            : previousDay && +new Date() - previousDay.end;
        previousDayEndedAgoStr = previousDay && formatDuration(previousDayEndedAgo);
    }

    function getPreviousDay() {
        if (!predefinedTime) {
            return $timelineLog[$timelineLog.length - 1];
        } else {
            for (let i = $timelineLog.length - 1; i >= 0; i--) {
                if ($timelineLog[i].start < predefinedTime.start) return $timelineLog[i];
            }
        }
    }

    function insertDay() {
        const insertedDay = {
            start: predefinedTime.start,
            end: predefinedTime.end,
            isConsequent: previousDay ? isConsequentChecked : false,
            dayLog: [],
        };
        $timelineLog.push(insertedDay);
        $timelineLog.sort((a, b) => a.start - b.start);

        const resultingIndex = $timelineLog.indexOf(insertedDay);
        const nextDay = $timelineLog[resultingIndex + 1];
        if (nextDay && !nextDay.isConsequent && nextDay.start - insertedDay.end < 24 * 3600_000) {
            popup(
                "The next day, which is not marked as consequent, now begins within " +
                    "24 hours of its preceding day. Consider marking it as consequent."
            );
        }

        $timelineLog = $timelineLog; // notify subscribers
        shown = false;
    }

    $: isConsequentChecked = previousDayEndedAgo < 24 * 3600_000;
    function initDay() {
        if (isSpecifyStartChecked) {
            initDayWithStartPicker();
        } else {
            $timelineLog.push({
                start: +new Date(),
                isConsequent: previousDay ? isConsequentChecked : false,
                dayLog: [],
            });
            $timelineLog = $timelineLog; // notify subscribers
        }
        shown = false;
    }

    function initDayWithStartPicker() {
        timeline.setTimestampPicker("Select the moment when the day started", (timestamp) => {
            if (timestamp > +new Date()) {
                popup("Cannot start a day from a point in the future");
                return;
            }
            if (previousDay && timestamp < previousDay.end) {
                popup("Cannot start a day before the last one's end");
                return;
            }
            $timelineLog.push({
                start: timestamp,
                isConsequent: previousDay !== undefined ? isConsequentChecked : false,
                dayLog: [],
            });
            $timelineLog = $timelineLog; // notify subscribers
        });
    }
</script>

<Dialog {shown} {onClosed}>
    {#if !previousDay}
        This will be the first day on the timeline
    {:else}
        <label>
            <input type="checkbox" bind:checked={isConsequentChecked} />
            Is consequent? (last day ended {previousDayEndedAgoStr}
            {predefinedTime ? "earlier" : "ago"})
        </label>
    {/if}
    {#if !predefinedTime}
        <label>
            <input type="checkbox" bind:checked={isSpecifyStartChecked} />
            Specify start (in past)
        </label>
    {/if}
    {#if predefinedTime}
        <button on:click={insertDay}>Insert</button>
    {:else}
        <button on:click={initDay}>Initialise</button>
    {/if}
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
