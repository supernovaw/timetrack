<script>
    export let onclick = undefined,
        style = undefined,
        disabled = undefined;
</script>

<button on:click={onclick} {style} {disabled} class="EditIconButton icon-button">
    <svg width="16" height="16" viewBox="0 0 512 512">
        <g fill="#777">
            <polygon points="263.75,145.68 43.5,365.92 43.5,466.5 152.04,466.5 368.31,250.23" />
            <path
                d="M 458.07,139.61 l -83.7,-83.69 c -5.76,-5.76 -15.1,-5.76 -20.86,0 l -67.13,67.13
                    l 104.56,104.55 l 67.13,-67.13 C 463.83,154.71 463.83,145.37 458.07,139.61 z"
            />
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
