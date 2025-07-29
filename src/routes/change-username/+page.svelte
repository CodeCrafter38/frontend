<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/Nexus_white.png';

	let oldUsername: string = $state('');
	let newUsername: string = $state('');
	let theme = $state('light');

	onMount(async () => {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		try {
			const user = await getUserStatus();
			oldUsername = user.data.user.username;
		} catch {
			alert('Sikertelen azonosítás!');
			goto('/login');
		}
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

	async function changeUsername() {
		if (oldUsername === '' || newUsername === '') {
			alert('Minden mezőt kötelező kitölteni!');
		} else {
			try {
				await api.post(
					'/change-username',
					{
						oldUsername: oldUsername,
						newUsername: newUsername
					},
					{
						headers: {
							'Content-Type': 'application/json'
						}
					}
				);

				alert('Felhasználónév módosítva!');
				goto('/user-profile');
			} catch (e: any) {
				alert(e.response?.data?.msg || 'Felhasználónév módosítása sikertelen!');
			}
		}
	}

	async function onLogout() {
		try {
			await logout();
		} catch {
			alert('Sikertelen kijelentkezés!');
		}
	}

	function onHome() {
		goto('/home');
	}

	function onProfilePage() {
		goto('/user-profile');
	}
</script>

<div class="sidebar">
	<div class="logo">
		<img src={logo} alt="Nexus logo" />
	</div>
	<button class="toggle-btn" on:click={toggleTheme}>
		{theme === 'light' ? '🌙' : '☀️'}
	</button>
	<button class="btn" on:click={onHome}>Kezdőlap</button>
	<button class="btn" on:click={onProfilePage}>Felhasználói profil</button>
	<button class="btn" on:click={onLogout}>Kijelentkezés</button>
</div>

<div class="content-pane">
	<h1>Felhasználónév módosítása</h1>
	<form on:submit|preventDefault={changeUsername}>
		<input bind:value={oldUsername} placeholder="Régi felhasználónév" />
		<input bind:value={newUsername} placeholder="Új felhasználónév" />
		<button class="btn" type="submit">Módosítás</button>
	</form>
</div>

<style>
	@import '../../app.css';
	@import '../new_post_comment.css';
</style>
