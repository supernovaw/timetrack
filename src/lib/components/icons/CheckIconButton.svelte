<script>
    export let onclick = undefined,
        style = undefined,
        disabled = undefined;
</script>

<button on:click={onclick} {style} {disabled} class="CheckIconButton icon-button">
    <svg width="16" height="16" viewBox="0 0 100 100">
        <g fill="#777">
            <polygon points="2,50 8,44 36,72 92,16 98,22 36,84" />
        </g>
    </svg>
</button>

<style>
    button:not(:disabled):hover g,
    button:not(:disabled):focus-visible g {
        fill: #fff;
    }

    g {
        transition: 0.2s ease-out;
    }
</style>
