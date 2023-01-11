<script>
    import { onMount } from "svelte";
    let navElement;

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
    });
</script>

<nav bind:this={navElement}>
    <div class="group">
        Day
        <div class="group-items">
            <button>Begin</button>
            <button>Edit</button>
            <button>Finish</button>
            <button>Continue</button>
        </div>
    </div>
    <div class="group">
        Activities
        <div class="group-items">
            <button>Edit</button>
        </div>
    </div>
</nav>

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
        font: inherit;
        text-align: start;
        transition: 0.1s ease-out;
        user-select: none;
        cursor: pointer;
        border: none;
        outline: none;
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
