<style>
	h1, figure, p {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	figure {
		margin: 0 0 1em 0;
	}

	img {
		width: 100%;
		max-width: 400px;
		margin: 0 0 1em 0;
	}

	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<script>
	let promise = getPlayers()

	async function getPlayers() {
		let resJson = await fetch('/topplayers')
		let res = await resJson.json()

		return res.users || []
	}


	function sorted(list) {
		return list.sort((a, b) => b.cardsPlayed - a.cardsPlayed)
	}
</script>

<h1>Top Players:</h1>

{#await promise}
	<p>Loading players...</p>
{:then players}
<ol>
	{#each sorted(players) as player}
		<li>{player.username} has played {player.cardsPlayed} cards.</li>
	{/each}
</ol>
{:catch error}
	<p style="color: red;">{error.text}</p>
{/await}
