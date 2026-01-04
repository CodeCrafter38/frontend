<!-- upload profile picture page -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { getUserStatus } from '$lib/auth';
	import { onMount } from 'svelte';
	import { logout } from '$lib/logout';
	import logo from '$lib/assets/Nexus_white.png';
	import api from '$lib/api';

	const MAX_SIZE_MB = 100;
	const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

	let user = null;
	let userName: string = $state('');
	let profilePicture: any = $state(null);
	let theme: 'light' | 'dark' = $state('light');

	let file: File | null = $state(null);
	let fileError: string = $state('');
	let fileWarning: string = $state('');

	let isUserLoaded = $state(false);

	onMount(async () => {
		user = await getUserStatus();
		if (!user) {
			goto('/login');
		}
		userName = user.username;
		profilePicture = user.profilePicture;
		isUserLoaded = true;

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

	function onHome() {
		goto('/home');
	}

	function onProfilePage() {
		goto('/user-profile');
	}

	async function onLogout() {
		try {
			await logout();
		} catch {
			alert('Sikertelen kijelentkezés!');
		}
	}

	function validateFile(f: File): string | null {
		const mimetype = f.type || '';
		const isImage = mimetype.startsWith('image/');
		if (!isImage) return 'Csak kép fájl tölthető fel (image/*).';

		if (f.size > MAX_SIZE_BYTES) {
			const mb = (f.size / (1024 * 1024)).toFixed(2);
			return `A fájl mérete (${mb} MB) meghaladja a megengedett ${MAX_SIZE_MB} MB-ot.`;
		}

		return null;
	}

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		// csak az első fájlt vesszük
		const selected = input?.files?.[0] ?? null;

		fileWarning = '';
		fileError = '';

		if (!selected) {
			input.value = '';
			return;
		}

		const err = validateFile(selected);
		if (err) {
			// ha rossz a fájl, maradjon üres
			file = null;
			fileError = err;
			input.value = '';
			return;
		}

		file = selected;

		// kiürítjük az inputot, hogy ugyanazt a fájlt is újra ki lehessen választani
		input.value = '';
	}

	function removeFile() {
		file = null;
		fileError = '';
		fileWarning = '';
	}

	async function updateProfilePicture() {
		if (file === null && profilePicture === null) {
			alert('Nincs fájl kiválasztva!');
			return;
		}

		try {
			const formData = new FormData();
			formData.append('userName', userName);
			formData.append('file', file!);

			// Multipart/form-data formátumban küldjük a fájlokat és a mezőket is,
			// nem JSON formátumban (mert egyébként a fájl tömb nem fájlként lesz értelmezve)
			await api.post('/users/upload-profile-picture', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});

			alert('Profilkép feltöltve');
			goto('/user-profile');
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Profilkép feltöltése sikertelen!');
		}
	}

	async function removeProfilePicture() {
		try {
			await api.delete('/users/remove-profile-picture', {
				data: {
					userName: userName
				}
			});

			alert('Profilkép törölve');
			profilePicture = null;
			goto('/user-profile');
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Profilkép törlése sikertelen!');
		}
	}

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		updateProfilePicture();
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
	<h1>Profilkép feltöltés</h1>

	<form onsubmit={onSubmit}>
		<input
			id="img"
			type="file"
			multiple
			accept="image/*"
			placeholder="Fájl helye"
			style="display:none;"
			onchange={onFileChange}
		/>
		<label class="btn" for="img">Kép kiválasztása</label>
		<br />
		<span class="file-label-text" style="margin-bottom: 10px;">
			{#if file}
				<span class="file-chip">
					{file.name}
					<button type="button" class="file-remove" onclick={() => removeFile()}> × </button>
				</span>
			{:else}
				Nincs fájl kiválasztva
			{/if}
		</span>
		<button class="btn" type="submit" disabled={file === null || fileError !== ''}
			>Profilkép beállítása</button
		>
	</form>
	<br />
	{#if profilePicture !== null || fileError !== ''}
		<button class="btn" style="width: 500px;" onclick={() => removeProfilePicture()}
			>Beállított profilkép törlése</button
		>
	{/if}
</div>

<style>
	@import '../../app.css';
	@import '../new_post_comment.css';
</style>
