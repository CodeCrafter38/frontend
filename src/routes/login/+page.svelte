<script>
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/Nexus_white.png';

	let email = '';
	let password = '';
	let theme = 'light';

	// téma betöltése a localStorage-ből az oldal betöltésekor
	onMount(() => {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		updateBodyClass();
	}

	function updateBodyClass() {
		document.body.classList.remove('light', 'dark');
		document.body.classList.add(theme);
	}

	async function login() {
		if (email == '' || password == '') {
			alert('Minden mezőt kötelező kitölteni!');
		} else {
			await api
				.post('/login', { email, password })
				.then((response) => {
					alert('Sikeres bejelentkezés');
					goto('/home');
				})
				.catch((error) => alert('Felhasználónév vagy jelszó nem egyezik!'));
		}
	}
</script>

<div class="top-right-bar">
	<div class="logo">
		<img src={logo} alt="Nexus logo" />
	</div>
	<button class="toggle-btn" on:click={toggleTheme}>
		{theme === 'light' ? '🌙' : '☀️'}
	</button>
</div>

<div class="left-pane">
	<h2>Üdvözlet a Nexus felületén</h2>
	<p>
		Szeretnél részt venni egy színes egyetemi közösség életében? Oszd meg gondolataidat, mondd el
		véleményedet, csatlakozz a csoportjaidhoz.<br />Új vagy itt? Kérlek olvasd el a
		<strong>GYIK</strong>-et (elkészítése folyamatban) posztolás előtt.
	</p>
</div>

<div class="right-pane">
	<h1>Bejelentkezés</h1>
	<br />
	<form on:submit|preventDefault={login}>
		<input type="text" bind:value={email} placeholder="Email cím" />
		<input type="password" bind:value={password} placeholder="Jelszó" />
		<input class="btn" type="submit" value="Bejelentkezés" />
	</form>
	<a href="/signup">Regisztráció</a>
</div>
