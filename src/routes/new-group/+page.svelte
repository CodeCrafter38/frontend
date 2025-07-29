<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/Nexus_white.png';
	import MultiSelect from '$lib/components/MultiSelect.svelte';

	type Group = {
		id: number;
		name: string;
	};

	let name: string = $state('');
	let description: string = $state('');
	let username: string = '';
	let theme = $state('light');

	onMount(async () => {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		try {
			const user = await getUserStatus();
			username = user.data.user.username;
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

	async function createGroup() {
		if (name === '' || description === '') {
			alert('Minden mezőt kötelező kitölteni!');
		} else {
			try {
				await api.post(
					'/groups/create',
					{
						name: name,
						description: description
					},
					{
						headers: {
							'Content-Type': 'application/json'
						}
					}
				);

				alert('Csoport létrehozva!');
				goto('/user-profile');
			} catch (e: any) {
				alert(e.response?.data?.msg || 'Csoport létrehozása sikertelen!');
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
	<h1>Új csoport létrehozása</h1>
	<form on:submit|preventDefault={createGroup}>
		<input bind:value={name} placeholder="Csoport neve" />
		<textarea bind:value={description} placeholder="Csoport leírása"></textarea>

		<button class="btn" type="submit">Csoport létrehozása</button>
	</form>
</div>

<style>
	@import '../../app.css';
	@import '../new_post_comment.css';
</style>
