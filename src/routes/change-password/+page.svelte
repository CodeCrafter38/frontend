<!-- change password page -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/Nexus_white.png';

	let user = null;
	let oldPassword: string = $state('');
	let newPassword: string = $state('');
	let newPasswordSecond: string = $state('');
	let theme: string = $state('light');

	onMount(async () => {
		// Felhasználó authentikáció ellenőrzése
		user = await getUserStatus();
		if (!user) {
			goto('/login');
		}

		// Téma betöltése a localStorage-ból
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

	async function changePassword() {
		if (oldPassword === '' || newPassword === '' || newPasswordSecond === '') {
			alert('Minden mezőt kötelező kitölteni!');
		} else if (newPassword !== newPasswordSecond) {
			alert('Az új jelszavak nem egyeznek!');
		} else if (newPassword.length < 8) {
			alert('Az új jelszónak legalább 8 karakter hosszúnak kell lennie!');
		} else {
			try {
				await api.post(
					'/change-password',
					{
						oldPassword: oldPassword,
						newPassword: newPassword
					},
					{
						headers: {
							'Content-Type': 'application/json'
						}
					}
				);

				alert('Jelszó módosítva!');
				goto('/user-profile');
			} catch (e: any) {
				alert(e.response?.data?.msg || 'Jelszó módosítása sikertelen!');
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
	<h1>Jelszó módosítása</h1>
	<form on:submit|preventDefault={changePassword}>
		<input type="password" bind:value={oldPassword} placeholder="Régi jelszó" />
		<input type="password" bind:value={newPassword} placeholder="Új jelszó" />
		<input type="password" bind:value={newPasswordSecond} placeholder="Új jelszó másodszor" />
		<button class="btn" type="submit">Módosítás</button>
	</form>
</div>

<style>
	@import '../../app.css';
	@import '../new_post_comment.css';
</style>
