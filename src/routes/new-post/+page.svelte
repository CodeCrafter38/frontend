<!-- new post page -->
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

	let user = null;
	let title: string = $state('');
	let content: string = $state('');
	let labels: string[] = $state([]);
	let files: any[] = $state([]);
	let videoLink: string = $state('');
	let userName: string = $state('');
	let userRole: string = $state('');
	let availableGroups: Group[] = $state([]);
	let selectedGroups: Group[] = $state([]);
	let isPublic = $state(false);
	let theme = $state('light');

	let isUserLoaded = $state(false);

	onMount(async () => {
		// Felhasználó authentikáció ellenőrzése
		user = await getUserStatus();
		if (!user) {
			goto('/login');
		}
		userName = user.username;
		userRole = user.role;
		isUserLoaded = true;

		// Téma betöltése a localStorage-ból
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		try {
			if (userRole === 'ADMIN') {
				const groupsOfAdmin = await api.get('/groups/all');
				groupsOfAdmin.data.forEach((group: any) => {
					availableGroups.push(group);
				});
				console.log('availableGroups: ', availableGroups);
			} else {
				const groupsOfUser = await api.get(`/groups/ofUser?username=${userName}`);
				groupsOfUser.data.forEach((group: any) => {
					availableGroups.push(group);
				});
			}
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
		if (userRole === 'STUDENT') {
			isPublic = true;
		}
		if (title === '' || content === '') {
			alert('A címet és a tartalmat kötelező kitölteni!');
		} else if (selectedGroups.length == 0 && !isPublic) {
			alert('Ha nem publikus a poszt, akkor legalább egy csoportot ki kell választani!');
		} else {
			try {
				const formData = new FormData();
				formData.append('title', title);
				formData.append('content', content);
				formData.append('isPublic', JSON.stringify(isPublic)); // boolean -> string
				formData.append('labels', JSON.stringify(labels)); // string[] -> JSON string
				formData.append('userName', userName);
				formData.append('videoLink', videoLink);

				// Több fájl esetén minden fájl hozzáadása
				files.forEach((file) => {
					formData.append('files', file);
				});

				selectedGroups.forEach((group) => {
					formData.append('selectedGroupIds', group.id.toString());
				});

				console.log('formData tartalma:', formData);

				// Multipart/form-data formátumban küldjük a fájlokat és a mezőket is,
				// nem JSON formátumban (mert egyébként a fájl tömb nem fájlként lesz értelmezve)
				await api.post('/posts', formData, {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				});

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

	function onFileChange(event: any) {
		files = Array.from(event.target.files);
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
		<MultiSelect bind:tags={labels} placeholder="Címke hozzáadása..." />
		<input
			type="file"
			multiple
			accept="image/*,.doc,.docx,.xls,.xlsx"
			placeholder="Fájl helye"
			on:change={onFileChange}
		/>
		<input type="url" bind:value={videoLink} placeholder="Youtube link helye" />

		{#if !isUserLoaded}
			<p>Betöltés...</p>
		{:else if userRole === 'STUDENT'}
			<p>A létrehozott poszt publikus lesz.</p>
		{:else if availableGroups.length}
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

<style>
	@import '../../app.css';
	@import '../new_post_comment.css';
</style>
