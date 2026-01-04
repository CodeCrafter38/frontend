<!-- new group page -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/Nexus_white.png';
	import type { GroupType } from '$lib/types';

	let user = null;
	let name: string = $state('');
	let description: string = $state('');
	let theme: 'light' | 'dark' = $state('light');
	let groupType: GroupType = $state('TEACHER_STUDENT');

	onMount(async () => {
		user = await getUserStatus();
		if (!user) goto('/login');

		const storedTheme = localStorage.getItem('theme');
		if (storedTheme === 'light' || storedTheme === 'dark') {
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

	async function createGroup() {
		if (name === '' || description === '') {
			alert('Minden mezőt kötelező kitölteni!');
			return;
		}

		try {
			console.log('groupType:', groupType);
			await api.post(
				'/groups/create',
				{
					name,
					description,
					teachersOnly: groupType === 'TEACHER_ONLY'
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

	// TODO: doksiba írni róla, hogy a createEventDispatcher() már elavult (deprecated), ezért külön eseménykezelő callback függvényt használtam
	//https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes-Component-events
	// const dispatch = createEventDispatcher();
	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		createGroup();
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

	<button class="toggle-btn" onclick={toggleTheme}>
		{theme === 'light' ? '🌙' : '☀️'}
	</button>

	<button class="btn" onclick={onHome}>Kezdőlap</button>
	<button class="btn" onclick={onProfilePage}>Felhasználói profil</button>
	<button class="btn" onclick={onLogout}>Kijelentkezés</button>
</div>

<div class="content-pane">
	<h1>Új csoport létrehozása</h1>

	<form onsubmit={onSubmit}>
		<input bind:value={name} placeholder="Csoport neve" />
		<textarea bind:value={description} placeholder="Csoport leírása"></textarea>
		<select class="btn" bind:value={groupType}>
			<option value="TEACHER_STUDENT">Tanár–diák csoport</option>
			<option value="TEACHER_ONLY">Csak tanárokból álló csoport</option>
		</select>
		<br />
		<button class="btn" type="submit">Csoport létrehozása</button>
	</form>
</div>

<style>
	@import '../../app.css';
	@import '../new_post_comment.css';
</style>
