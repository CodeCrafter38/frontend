<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';

	import { uiIsAuthenticated, uiProfilePictureUrl, uiUserName, uiUserRole } from '$lib/stores/ui';

	let user = null;
	let oldPassword: string = $state('');
	let newPassword: string = $state('');
	let newPasswordSecond: string = $state('');

	onMount(async () => {
		user = await getUserStatus();
		if (!user) {
			goto('/login');
			return;
		}

		uiIsAuthenticated.set(true);
		uiUserName.set(user.username);
		uiUserRole.set(user.role);

		if (user.profilePicture?.filename) {
			uiProfilePictureUrl.set(
				`http://localhost:4000/api/files/profile-picture?filename=${user.profilePicture.filename}`
			);
		} else {
			uiProfilePictureUrl.set(null);
		}
	});

	async function changePassword() {
		if (oldPassword === '' || newPassword === '' || newPasswordSecond === '') {
			alert('Minden mezőt kötelező kitölteni!');
			return;
		}
		if (newPassword !== newPasswordSecond) {
			alert('Az új jelszavak nem egyeznek!');
			return;
		}
		if (newPassword.length < 8) {
			alert('Az új jelszónak legalább 8 karakter hosszúnak kell lennie!');
			return;
		}

		try {
			await api.post(
				'/change-password',
				{ oldPassword, newPassword },
				{ headers: { 'Content-Type': 'application/json' } }
			);

			alert('Jelszó módosítva!');
			goto('/user-profile');
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Jelszó módosítása sikertelen!');
		}
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

	function onHome() {
		goto('/home');
	}

	function onProfilePage() {
		goto('/user-profile');
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
				<h1>Jelszó módosítása</h1>
				<form on:submit|preventDefault={changePassword}>
					<input type="password" bind:value={oldPassword} placeholder="Régi jelszó" />
					<input type="password" bind:value={newPassword} placeholder="Új jelszó" />
					<input type="password" bind:value={newPasswordSecond} placeholder="Új jelszó másodszor" />
					<button class="btn btn-wide" type="submit">Módosítás</button>
				</form>
			</div>
		</div>
	</main>
</div>
