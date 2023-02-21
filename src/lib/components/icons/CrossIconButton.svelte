<script>
    export let onclick = undefined,
        style = undefined,
        disabled = undefined;
</script>

<button on:click={onclick} {style} {disabled} class="CrossIconButton icon-button">
    <svg width="16" height="16" viewBox="0 0 100 100">
        <g fill="#777">
            <path
                d="M0 6 L6 0 L50 44 L94 0 L100 6 L56 50 L100 94 L94 100 L50 56 L6 100 L0 94 L44 50 Z"
            />
        </g>
    </svg>
</button>

<style>
    button:not(:disabled):hover g,
    button:not(:disabled):focus-visible g {
        fill: #ff648e;
    }

    g {
        transition: 0.2s ease-out;
    }
</style>
