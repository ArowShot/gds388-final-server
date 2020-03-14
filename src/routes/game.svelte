<svelte:head>
	<title>Play Uno</title>
</svelte:head>

{#if process.browser}
<script>
	let unityInstance = UnityLoader.instantiate("unityContainer", "Build/WebGL.json", {onProgress: UnityProgress});
</script>
{/if}

<div class="webgl-content">
	<div id="unityContainer" style="width: 960px; height: 600px"></div>
		<div class="footer">
		<div class="webgl-logo"></div>
		<div class="fullscreen" onclick="unityInstance.SetFullscreen(1)"></div>
		<div class="title">WebAPIFinal</div>
	</div>
</div>