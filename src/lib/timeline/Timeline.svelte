<script>
    import { onMount } from "svelte";
    import timeline from "./timeline";
    export let style;
    let canvas;

    onMount(() => {
        timeline.canvas = canvas;

        const onResize = timeline.onResize.bind(timeline);
        onResize(); // provide the timeline with initial size

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    });
</script>

<canvas
    bind:this={canvas}
    {style}
    on:click={timeline.onClick.bind(timeline)}
    on:mousemove={timeline.onMouseMove.bind(timeline)}
    on:wheel={timeline.onWheel.bind(timeline)}
/>
