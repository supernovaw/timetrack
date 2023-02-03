<script>
    import { onMount, tick } from "svelte";
    import { timelineLog } from "$lib/state";
    import InitDayDialog from "./dialogs/InitDayDialog.svelte";
    import popup from "$lib/popups";
    import formatDuration from "$lib/timeline/durationFormatter";

    let navElement;
    let shownDialog = null; // "init-day" | null

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
            e.target.closest(".group")?.classList.remove("open");
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
        if (lastDay && !lastDay.end) {
            popup("Last day has to be finished in order to start a new one");
            return;
        }
        shownDialog = "init-day";
    }

    function handleEditDay() {
        popup("TODO implement edit day");
    }

    function handleFinishDay() {
        if (!lastDay) {
            popup("Timeline history is empty");
            return;
        }
        const now = +new Date();
        if (lastDay.end) {
            const passedTime = now - lastDay.end;
            const passedTimeStr = formatDuration(passedTime);
            popup("Last day is already finished (" + passedTimeStr + " ago)");
            return;
        }
        lastDay.end = now;
        $timelineLog = $timelineLog;
    }

    function handleContinueDay() {
        if (!lastDay.end) {
            popup("Last day is still not finished");
            return;
        }
        lastDay.end = undefined;
        $timelineLog = $timelineLog;
    }

    function handleRemoveDay() {
        popup("TODO implement remove day");
    }
</script>

<nav bind:this={navElement}>
    <div class="group">
        Day
        <div class="group-items">
            <button on:click={handleInitDay}>Begin</button>
            <button on:click={handleEditDay}>Edit</button>
            <button on:click={handleFinishDay}>Finish</button>
            <button on:click={handleContinueDay}>Continue</button>
            <button on:click={handleRemoveDay}>Remove</button>
        </div>
    </div>
    <div class="group">
        Activities
        <div class="group-items">
            <button>Edit</button>
        </div>
    </div>
</nav>

<InitDayDialog shown={shownDialog === "init-day"} onClosed={closeDialog} />

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
        box-shadow: none;
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
