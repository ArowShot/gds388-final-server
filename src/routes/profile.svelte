<svelte:head>
	{#await promise}
		<title>Uno Profile</title>
	{:then user}
		<title>{user.username}'s Uno Profile</title>
	{/await}
</svelte:head>

<script>
	import { notifier } from '@beyonk/svelte-notifications'

	let user = localStorage.getItem("user")
	let promise = getUserData()
	let authData = {
		newusername: ''
	}

	async function getUserData() {
		let statsJson = await fetch('/stats', {
        	method: 'GET',
			withCredentials: true,
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem("authToken")}`
			}
		})
		let stats = await statsJson.json()

		return stats
	}

	async function changeUsername() {
		let resJson = await fetch('/changename', {
        	method: 'POST',
			withCredentials: true,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem("authToken")}`
			},
			body: JSON.stringify(authData)
		})
		let res = await resJson.json()
		console.log(res)
		if(res.error) {
			notifier.danger(res.error)
		} else {
			notifier.success(`Changed name to ${res.newusername}`)
		}
		promise = getUserData()
	}
</script>

{#await promise}
	<p>Loading stats...</p>
{:then user}
	<h1>Welcome, {user.username}</h1>
	<form on:submit|preventDefault={changeUsername}>
		<input type="text" bind:value={authData.newusername}/>
		<input type="submit" value="Change Username"/>
	</form>
	<p>You have played {user.cardsPlayed} cards</p>
	<p>You have drawn {user.cardsDrawn} cards (except for you starting hands)</p>
{:catch error}
	<p style="color: red;">{error.text}</p>
{/await}
