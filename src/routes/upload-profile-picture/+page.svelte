<script lang="ts">
	import { goto } from '$app/navigation';
	import { getUserStatus } from '$lib/auth';
	import { onMount } from 'svelte';
	import { logout } from '$lib/logout';
	import api from '$lib/api';

	import { uiIsAuthenticated, uiProfilePictureUrl, uiUserName, uiUserRole } from '$lib/stores/ui';

	const MAX_SIZE_MB = 100;
	const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

	let user = null;
	let userName: string = $state('');
	let profilePicture: any = $state(null);

	let file: File | null = $state(null);
	let fileError: string = $state('');
	let fileWarning: string = $state('');

	onMount(async () => {
		user = await getUserStatus();
		if (!user) {
			goto('/login');
			return;
		}

		userName = user.username;
		profilePicture = user.profilePicture;

		uiIsAuthenticated.set(true);
		uiUserName.set(userName);
		uiUserRole.set(user.role);

		if (profilePicture?.filename) {
			uiProfilePictureUrl.set(
				`http://localhost:4000/api/files/profile-picture?filename=${profilePicture.filename}`
			);
		} else {
			uiProfilePictureUrl.set(null);
		}
	});

	function onHome() {
		goto('/home');
	}

	function onProfilePage() {
		goto('/user-profile');
	}

	async function onLogout() {
		try {
			await logout();
			uiIsAuthenticated.set(false);
			uiProfilePictureUrl.set(null);
			uiUserName.set('');
			uiUserRole.set('');
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
		const selected = input?.files?.[0] ?? null;

		fileWarning = '';
		fileError = '';

		if (!selected) {
			input.value = '';
			return;
		}

		const err = validateFile(selected);
		if (err) {
			file = null;
			fileError = err;
			input.value = '';
			return;
		}

		file = selected;
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

			await api.post('/users/upload-profile-picture', formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
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
				data: { userName }
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

<div class="page-container">
	<aside class="sidebar">
		<button class="btn" on:click={onHome}>Kezdőlap</button>
		<button class="btn" on:click={onProfilePage}>Felhasználói profil</button>
		<button class="btn" on:click={onLogout}>Kijelentkezés</button>
	</aside>

	<main class="content-pane">
		<div class="content-inner">
			<div class="form-card">
				<h1>Profilkép feltöltés</h1>

				<form on:submit={onSubmit}>
					<input
						id="img"
						type="file"
						accept="image/*"
						style="display:none;"
						on:change={onFileChange}
					/>
					<label class="btn" for="img">Kép kiválasztása</label>

					<span class="file-label-text">
						{#if file}
							<span class="file-chip">
								{file.name}
								<button type="button" class="file-remove" on:click={() => removeFile()}>×</button>
							</span>
						{:else}
							Nincs fájl kiválasztva
						{/if}
					</span>

					<button class="btn btn-wide" type="submit" disabled={file === null || fileError !== ''}>
						Profilkép beállítása
					</button>
				</form>

				<br />

				{#if profilePicture !== null || fileError !== ''}
					<button class="btn btn-wide" on:click={() => removeProfilePicture()}>
						Beállított profilkép törlése
					</button>
				{/if}
			</div>
		</div>
	</main>
</div>
