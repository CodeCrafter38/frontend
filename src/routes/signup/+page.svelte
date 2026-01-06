<script>
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { onMount } from 'svelte';
	import { uiClear } from '$lib/stores/ui';

	let username = '';
	let email = '';
	let password = '';
	let role = 'STUDENT';

	onMount(() => {
		uiClear();
	});

	async function signup() {
		if (username == '' || email == '' || password == '') {
			alert('Minden mezőt kötelező kitölteni!');
			goto('/signup');
			return;
		}

		await api
			.post('/signup', { username, email, password, role })
			.then((response) => {
				if (response.status !== 200) throw new Error('Sikertelen regisztráció!');
				alert('Felhasználó létrehozva');
				goto('/login');
			})
			.catch(() => alert('Sikertelen regisztráció!'));
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
	<h1>Regisztráció</h1>
	<form on:submit|preventDefault={signup} class="form-card">
		<input type="text" bind:value={username} placeholder="Felhasználónév" />
		<input type="text" bind:value={email} placeholder="Email cím" />
		<input type="password" bind:value={password} placeholder="Jelszó" />
		<select bind:value={role}>
			<option value="TEACHER">tanár vagyok</option>
			<option value="STUDENT">diák vagyok</option>
		</select>
		<br />
		<input class="btn" type="submit" value="Regisztráció" />
	</form>
	<a href="/login">Bejelentkezés</a>
</div>
