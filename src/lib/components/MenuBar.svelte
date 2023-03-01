<script>
    import { onMount, tick } from "svelte";
    import { timelineLog } from "$lib/state";
    import InitDayDialog from "./dialogs/InitDayDialog.svelte";
    import timeline from "$lib/timeline/timeline";
    import popup from "$lib/popups/";
    import EditDayDialog from "./dialogs/EditDayDialog.svelte";
    import { findDayIndex, findTaskIndex } from "$lib/timeline/utilities";
    import formatDuration from "$lib/timeline/durationFormatter";
    import ConfirmDialog from "./dialogs/ConfirmDialog.svelte";
    import EditActivitiesDialog from "./dialogs/EditActivitiesDialog.svelte";

    let navElement;
    let shownDialog = null; // "init-day" | "edit-day" | "edit-activities" | null
    let editedDayIndex;

    let confirmDialog;

    function closeDialog() {
        shownDialog = null;
        // Prevents the button that opened a dialog from re-gaining focus
        tick().then(() => document.activeElement.blur());
    }

    onMount(() => {
        const onEnter = (e) => e.target.classList.add("open"),
            onLeave = (e) => e.target.classList.remove("open");
        for (const g of navElement.querySelectorAll(".group")) {
            g.addEventListener("mouseenter", onEnter);
            g.addEventListener("mouseleave", onLeave);
        }
        navElement.addEventListener("click", (e) => {
            if (e.target.nodeName !== "BUTTON") return;
            navElement.querySelector(".group.open")?.classList.remove("open");
            e.target.blur(); // Remove focus from buttons so they're not causing dropdowns to stay shown
        });
        return () => {
            for (const g of navElement.querySelectorAll(".group")) {
                g.removeEventListener("mouseenter", onEnter);
                g.removeEventListener("mouseleave", onLeave);
            }
        };
    });

    $: lastDay = $timelineLog[$timelineLog.length - 1];

    function handleInitDay() {
        shownDialog = "init-day";
    }

    function handleEditToday() {
        editedDayIndex = $timelineLog.length - 1;
        shownDialog = "edit-day";
    }

    function handleEditPastDay() {
        timeline.setTimestampPicker("Choose day to edit", (pickedTimestamp) => {
            editedDayIndex = findDayIndex($timelineLog, pickedTimestamp);
            if (editedDayIndex !== -1) {
                shownDialog = "edit-day";
                timeline.removeTimestampPicker();
            }
        });
    }

    function handleFinishDay() {
        const lastTask = lastDay.dayLog.at(-1);
        if (lastTask && !lastTask.end) {
            return popup("Cannot end day with an unfinished task");
        }
        confirmDialog = {
            text: "Confirm finishing today",
            yesHandler: () => {
                lastDay.end = +new Date();
                $timelineLog = $timelineLog;
            },
        };
    }

    function handleContinueDay() {
        const endedAgo = formatDuration(+new Date() - lastDay.end);
        confirmDialog = {
            text: `Confirm continuing last day (ended: ${endedAgo} ago)`,
            yesHandler: () => {
                lastDay.end = undefined;
                $timelineLog = $timelineLog;
            },
        };
    }

    function handleInsertTask() {}

    function handleEditTask() {}

    function handleShiftTask() {
        timeline.setTimestampPicker("Click on a task's start or end to shift it", (timestamp) => {
            const day = $timelineLog[findDayIndex($timelineLog, timestamp)];
            if (day === undefined) return;
            const taskIndex = findTaskIndex(day, timestamp);
            const task = day.dayLog[taskIndex];
            if (task === undefined) return;

            let shiftEnd; // false is start, true is end;
            if (task.end) {
                const distanceToStart = timestamp - task.start;
                const distanceToEnd = task.end - timestamp;
                shiftEnd = distanceToEnd < distanceToStart;
            } else {
                shiftEnd = false;
            }

            if (!shiftEnd) {
                timeline.setTimestampPicker(
                    `Choose new start of ${task.activityName}`,
                    (timestamp) => {
                        if (timestamp > +new Date()) {
                            return popup("Please select a point in past");
                        }
                        if (timestamp < day.start) {
                            return popup("Cannot start this task before the day's start");
                        }
                        if (task.end && timestamp > task.end) {
                            return popup("A task cannot start after its end");
                        }
                        const previousTask = day.dayLog[taskIndex - 1];
                        if (previousTask && timestamp < previousTask.end) {
                            return popup("Cannot start this task before the previous task's end");
                        }
                        task.start = timestamp;
                        $timelineLog = $timelineLog;
                    }
                );
            } else {
                timeline.setTimestampPicker(
                    `Choose new end of ${task.activityName}`,
                    (timestamp) => {
                        if (timestamp > +new Date()) {
                            return popup("Please select a point in past");
                        }
                        if (day.end && timestamp > day.end) {
                            return popup("A task cannot end after the day's end");
                        }
                        if (timestamp < task.start) {
                            return popup("A task cannot end before its start");
                        }
                        const nextTask = day.dayLog[taskIndex + 1];
                        if (nextTask && timestamp > nextTask.start) {
                            return popup("Cannot start this task after the next task's start");
                        }
                        task.end = timestamp;
                        $timelineLog = $timelineLog;
                    }
                );
            }
        });
    }

    function handleRemoveTask() {}

    function handleEditActivities() {
        shownDialog = "edit-activities";
    }
</script>

<nav bind:this={navElement}>
    <div class="group">
        Day
        <div class="group-items">
            {#if !lastDay || lastDay.end}
                <button on:click={handleInitDay}>Start new day</button>
            {/if}
            {#if lastDay}
                <!-- If timeline is not empty -->
                {#if !lastDay.end}
                    <button on:click={handleEditToday}>Edit today</button>
                    <button on:click={handleFinishDay}>Finish today</button>
                {:else}
                    <button on:click={handleContinueDay}>Continue last day</button>
                {/if}
                <button on:click={handleEditPastDay}>Edit past day</button>
            {/if}
        </div>
    </div>
    <div class="group">
        Tasks
        <div class="group-items">
            <button on:click={handleInsertTask}>Insert</button>
            <button on:click={handleEditTask}>Edit</button>
            <button on:click={handleShiftTask}>Shift</button>
            <button on:click={handleRemoveTask}>Remove</button>
        </div>
    </div>
    <div class="group">
        Activities
        <div class="group-items">
            <button on:click={handleEditActivities}>Edit</button>
        </div>
    </div>
</nav>

<InitDayDialog shown={shownDialog === "init-day"} onClosed={closeDialog} />
<EditDayDialog
    shown={shownDialog === "edit-day"}
    onClosed={closeDialog}
    dayIndex={editedDayIndex}
/>
<EditActivitiesDialog shown={shownDialog === "edit-activities"} onClosed={closeDialog} />
<ConfirmDialog dialog={confirmDialog} />

<style>
    nav {
        display: flex;
        box-shadow: 0 0 4px #1a1a1a;
    }

    .group {
        padding: 6px 18px;
        position: relative;
        background-color: #1a1a1a;
        transition: 0.1s ease-out;
        user-select: none;
        cursor: default;
    }

    .group:global(.open) {
        z-index: 1;
        background-color: #272727;
    }

    .group .group-items {
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 100%;
        display: flex;
        flex-direction: column;
        transition: 0.1s ease-out;
        opacity: 0;
        translate: 0 -5px;
        pointer-events: none;
    }

    :root[dir="rtl"] .group .group-items {
        left: unset;
        right: 0;
    }

    .group:global(.open) .group-items,
    .group-items:focus-within {
        opacity: 1;
        translate: 0 0;
        pointer-events: all;
    }

    button {
        padding: 6px 9px;
        color: white;
        background-color: #3333;
        backdrop-filter: blur(4px);
        text-align: start;
        border: none;
        border-radius: 0;
        outline: none;
        translate: 0 0;
        min-width: max-content;
    }

    button:hover,
    button:focus-visible {
        background-color: #3337;
    }

    button:active {
        transform: scale(1.1);
    }

    button:focus-within {
        z-index: 1;
    }
</style>
