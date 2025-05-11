<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/Nexus_white.png';

	type Group = {
		group_id: number;
		name: string;
	};

	let title: string = $state('');
	let content: string = $state('');
	let userName: string = '';
	let availableGroups: Group[] = $state([]);
	let selectedGroups: Group[] = $state([]);
	let isPublic = $state(false);
	let theme = $state('light');

	onMount(async () => {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		try {
			const user = await getUserStatus();
			userName = user.data.user;
		} catch {
			alert('Sikertelen azonosítás!');
			goto('/login');
		}

		try {
			const groupsOfUser = await api.get(`/groups/ofUser?username=${userName}`);
			groupsOfUser.data.forEach((group: any) => {
				availableGroups.push(group);
			});
		} catch {
			alert('Csoportok lekérdezése sikertelen!');
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

	async function createPost() {
		if (title === '' || content === '') {
			alert('A címet és a tartalmat kötelező kitölteni!');
		} else {
			try {
				const selectedGroupIds = selectedGroups.map((g) => g.group_id);
				await api.post('/posts', { title, content, userName, isPublic, selectedGroupIds });
				alert('Poszt létrehozva');
				goto('/home');
			} catch (e: any) {
				alert(e.response?.data?.msg || 'Poszt létrehozása sikertelen!');
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

	function toggleGroup(item: Group) {
		if (selectedGroups.includes(item)) {
			selectedGroups = selectedGroups.filter((i) => i !== item);
		} else {
			selectedGroups = [...selectedGroups, item];
		}
	}

	function onHome() {
		goto('/home');
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
	<button class="btn" on:click={onLogout}>Kijelentkezés</button>
</div>

<div class="content-pane">
	<h1>Új poszt létrehozása</h1>
	<form on:submit|preventDefault={createPost}>
		<input bind:value={title} placeholder="Cím" />
		<textarea bind:value={content} placeholder="Tartalom"></textarea>

		{#if availableGroups.length}
			<label>
				<input type="checkbox" bind:checked={isPublic} />
				Nyilvános
			</label>
			<div>Válaszd ki a csoportokat:</div>
			{#each availableGroups as availableGroup}
				<label>
					<input
						type="checkbox"
						disabled={isPublic}
						checked={selectedGroups.includes(availableGroup)}
						on:change={() => toggleGroup(availableGroup)}
					/>
					{availableGroup.name}
				</label><br />
			{/each}
			<p>
				Kiválasztott csoportok:
				{#each selectedGroups as g, i}
					{g.name}{i < selectedGroups.length - 1 ? ', ' : ''}
				{/each}
			</p>
		{:else}
			<p>Nem vagy benne egyik csoportban sem, csak nyilvános posztot tudsz létrehozni.</p>
		{/if}

		<button class="btn" type="submit">Poszt létrehozása</button>
	</form>
</div>
S

<style>
	@import '../new_post_comment.css';
</style>
