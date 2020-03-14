<svelte:head>
	<title>Login</title>
</svelte:head>

<script>
	import { notifier } from '@beyonk/svelte-notifications'

	let authData = {
		username: '',
		password: '',
		password2: ''
	}

	async function login() {
		let res = await fetch('/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(authData)
		})

		res = await res.json() 
		
		if(res.authToken) {
			localStorage.setItem('authToken', res.authToken)
			window.location.replace('/profile')
		} else if(res.error) {
			notifier.danger(res.error)
		} else {
			notifier.danger("Something went wrong :(")
		}
	}
</script>

<form on:submit|preventDefault={login}>
	<h1>Login</h1>
	<br>
	<h3>Username</h3>
	<input type="text" bind:value={authData.username}>
	<h3>Password</h3>
	<input type="password" bind:value={authData.password}>
	<h3>Repeat Password</h3>
	<input type="password" bind:value={authData.password2}>
	<br>
	<input type="submit" value="Login">
</form>

<style>
form {
	display: flex;
	flex-direction: column;
	margin: auto;
	text-align: center;
	padding: 10px;
	width: 60%;
}

input {
	font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
	font-size: 14px;
	line-height: 1.5;
	color: #333;
	margin: 5px;
}

input[type="submit"] {
	background: none;
	border: #333 1px solid;
}
input[type="submit"]:hover {
	background: #DDD;
}
</style>