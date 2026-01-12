<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { onMount } from 'svelte';
	import { uiClear } from '$lib/stores/ui';

	let email = '';
	let password = '';
	let role: 'TEACHER' | 'STUDENT' = 'STUDENT';

	onMount(() => {
		uiClear();
	});

	async function loginWithEmail() {
		if (email == '' || password == '') {
			alert('Minden mezőt kötelező kitölteni!');
			return;
		}

		try {
			const response = await api.post('/login', { email, password });
			if (response.status === 200) {
				goto('/home');
			} else {
				const msg = response.data?.msg;
				alert(`Bejelentkezés sikertelen: ${msg}`);
			}
		} catch (error: any) {
			const msg =
				error?.response?.data?.msg ?? error?.message ?? 'Felhasználónév vagy jelszó nem egyezik!';
			alert(`Bejelentkezés sikertelen: ${msg}`);
		}
	}

	async function loginWithGoogle() {
		window.location.href = `http://localhost:4000/api/auth/google?role=${encodeURIComponent(role)}`;
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

	<select bind:value={role} style="max-width: 170px;">
		<option value="TEACHER">tanár vagyok</option>
		<option value="STUDENT">diák vagyok</option>
	</select>
	<button class="btn" on:click={loginWithGoogle}>Belépés Google fiókkal</button>

	<hr />

	<a href="/signup">Regisztráció</a>
</div>
