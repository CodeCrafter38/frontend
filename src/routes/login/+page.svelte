<script>
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { onMount } from 'svelte';
	import { uiClear } from '$lib/stores/ui';

	let email = '';
	let password = '';

	onMount(() => {
		uiClear();
	});

	async function loginWithEmail() {
		if (email == '' || password == '') {
			alert('Minden mezőt kötelező kitölteni!');
			return;
		}

		await api
			.post('/login', { email, password })
			.then(() => goto('/home'))
			.catch(() => alert('Felhasználónév vagy jelszó nem egyezik!'));
	}

	async function loginWithGoogle() {
		window.location.href = 'http://localhost:4000/api/auth/google';
	}
</script>

<div class="left-pane">
	<h2>Üdvözlet a Nexus felületén</h2>
	<p>
		Szeretnél részt venni egy színes egyetemi közösség életében? Oszd meg gondolataidat, mondd el
		véleményedet, csatlakozz a csoportjaidhoz.<br />
		Új vagy itt? Kérlek olvasd el a <strong>GYIK</strong>-et (elkészítése folyamatban) posztolás
		előtt.
	</p>
</div>

<div class="right-pane">
	<h1>Bejelentkezés</h1>
	<form on:submit|preventDefault={loginWithEmail} class="form-card">
		<input type="text" bind:value={email} placeholder="Email cím" />
		<input type="password" bind:value={password} placeholder="Jelszó" />
		<input class="btn" type="submit" value="Bejelentkezés" />
	</form>

	<hr />

	<button class="btn" on:click={loginWithGoogle}>Belépés Google fiókkal</button>

	<hr />

	<a href="/signup">Regisztráció</a>
</div>
