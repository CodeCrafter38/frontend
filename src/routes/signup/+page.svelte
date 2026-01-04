<!-- signup page -->
<script>
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/Nexus_white.png';

	let username = '';
	let email = '';
	let password = '';
	let role = 'STUDENT';
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

	async function signup() {
		if (username == '' || email == '' || password == '' || role == '') {
			alert('Minden mezőt kötelező kitölteni!');
			goto('/signup');
		} else {
			await api
				.post('/signup', { username, email, password, role })
				.then((response) => {
					if (response.status !== 200) {
						throw new Error('Sikertelen regisztráció!');
					}
					alert('Felhasználó létrehozva');
					goto('/login');
				})
				.then((data) => console.log(data))
				.catch((error) => alert('Sikertelen regisztráció!'));
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
	<h1>Regisztráció</h1>
	<br />
	<form on:submit|preventDefault={signup}>
		<input type="text" bind:value={username} placeholder="Felhasználónév" />
		<input type="text" bind:value={email} placeholder="Email cím" />
		<input type="password" bind:value={password} placeholder="Jelszó" />
		<select class="btn" bind:value={role}>
			<option value="TEACHER">tanár vagyok</option>
			<option value="STUDENT">diák vagyok</option>
		</select>
		<br />
		<input class="btn" type="submit" value="Regisztráció" />
	</form>
	<a href="/login">Bejelentkezés</a>
</div>
