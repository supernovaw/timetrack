<script>
    import { slide } from "svelte/transition";
    import { timelineLog, activities } from "$lib/state/";
    import popup from "$lib/popups";
    import formatDuration from "$lib/timeline/durationFormatter";
    import moment from "moment";
    import InitTaskDialog from "./dialogs/InitTaskDialog.svelte";
    import ConfirmDialog from "./dialogs/ConfirmDialog.svelte";
    import timeline from "$lib/timeline/timeline";
    import EditTaskDialog from "./dialogs/EditTaskDialog.svelte";
    import EditDayDialog from "./dialogs/EditDayDialog.svelte";

    $: lastDay = $timelineLog.at(-1);
    $: lastTask = lastDay?.dayLog.at(-1);

    let shownDialog; // undefined | "edit-today" | "init-task" | "edit-task"
    const closeDialog = () => (shownDialog = undefined);

    let confirmDialog;

    function handleContinueDay() {
        confirmDialog = {
            text: "Confirm continuing last day",
            yesHandler: () => {
                lastDay.end = undefined;
                $timelineLog = $timelineLog;
            },
        };
    }

    function handleEditToday() {
        shownDialog = "edit-today";
    }

    function handleFinishToday() {
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

    function handleInitTask() {
        if ($activities.list.length === 0) {
            popup("In order to start a task, create some activities first");
            return;
        }
        shownDialog = "init-task";
    }

    function handleContinueTask() {
        const endedAgo = formatDuration(+new Date() - lastTask.end);
        confirmDialog = {
            text: `Confirm continuing ${lastTask.activityName} (ended ${endedAgo} ago)`,
            yesHandler: () => {
                lastTask.end = undefined;
                $timelineLog = $timelineLog;
            },
        };
    }

    function handleStopTask() {
        lastTask.end = +new Date();
        $timelineLog = $timelineLog;
    }

    function handleStopTaskInPast() {
        timeline.setTimestampPicker("Select task end", (timestamp) => {
            if (timestamp > +new Date()) {
                return popup("Please select a point in past");
            }
            if (timestamp < lastTask.start) {
                return popup("Cannot end the task before its start");
            }
            if (timestamp < lastDay.start) {
                return popup("Cannot end the task before the day's start");
            }
            lastTask.end = timestamp;
            $timelineLog = $timelineLog;
        });
    }

    function handleEditTask() {
        shownDialog = "edit-task";
    }

    function formatTask(task) {
        const name = task.activityName;
        const subc = task.activitySubcategory;
        const desc = task.description;
        return name + (subc && ` (${subc})`) + (desc && `: ${desc}`);
    }

    function formatCurrentTask(task) {
        const startedAgo = formatDuration(+new Date() - task.start);
        return formatTask(task) + `, started ${startedAgo} ago`;
    }

    function formatLastTask(task) {
        const endedAgo = formatDuration(+new Date() - task.end);
        return formatTask(task) + `, ended ${endedAgo} ago`;
    }
</script>

<div class="controls">
    <div class="controls-inner">
        <div class="day-status">
            {#if lastDay === undefined}
                <div transition:slide|local>Timeline is empty. Start a new day to begin.</div>
            {:else if lastDay.end}
                <div transition:slide|local>
                    Last day ended {formatDuration(+new Date() - lastDay.end)} ago
                    <button on:click={handleContinueDay}>Continue</button>
                </div>
            {:else}
                <div transition:slide|local>
                    Today started at {moment(lastDay.start).format("MMM DD HH:mm")}
                    ({formatDuration(+new Date() - lastDay.start)} ago)
                    <div style="display: inline-block">
                        <button on:click={handleEditToday}>Edit</button>
                        <button on:click={handleFinishToday}>Finish</button>
                    </div>
                </div>
            {/if}
        </div>

        {#if lastDay && !lastDay.end}
            <div style="margin-top: 16px" transition:slide|local>
                {#if !lastTask}
                    <div transition:slide|local>
                        <div class="task-status">Today is empty</div>
                        <div class="buttons">
                            <button on:click={handleInitTask}>Start new task</button>
                        </div>
                    </div>
                {:else if lastTask.end}
                    <div transition:slide|local>
                        <div class="task-status">Last task: {formatLastTask(lastTask)}</div>
                        <div class="buttons">
                            <button on:click={handleInitTask}>Start new task</button>
                            <button on:click={handleContinueTask}>Continue last task</button>
                        </div>
                    </div>
                {:else}
                    <div transition:slide|local>
                        <div class="task-status">Current task: {formatCurrentTask(lastTask)}</div>
                        <div class="buttons">
                            <button on:click={handleEditTask}>Edit task</button>
                            <button on:click={handleStopTask}>Stop task</button>
                            <button on:click={handleStopTaskInPast}>Stop task (in past)</button>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<EditDayDialog
    shown={shownDialog === "edit-today"}
    onClosed={closeDialog}
    dayIndex={$timelineLog.length - 1}
/>
<InitTaskDialog shown={shownDialog === "init-task"} onClosed={closeDialog} />
<EditTaskDialog shown={shownDialog === "edit-task"} onClosed={closeDialog} task={lastTask} />
<ConfirmDialog dialog={confirmDialog} />

<style>
    .controls {
        max-width: 700px;
        margin: auto;
    }

    .controls-inner {
        margin: 16px;
        padding: 16px;
        background-color: #171717;
        border-radius: 4px;
    }

    .day-status {
        text-align: center;
        opacity: 0.8;
        user-select: none;
    }

    .task-status {
        opacity: 0.8;
        user-select: none;
        margin-bottom: 8px;
    }

    .buttons {
        padding: 2px;
        display: flex;
        gap: 8px;
    }
</style>
