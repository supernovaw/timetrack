<script>
    import MenuBar from "$lib/components/MenuBar.svelte";
    import Timeline from "$lib/timeline/Timeline.svelte";
    import Controls from "$lib/components/Controls.svelte";
    import Popups from "$lib/popups/Popups.svelte";
</script>

<MenuBar />
<Timeline style="width: 100%; height: 250px; display: block" />
<Controls />
<Popups />
