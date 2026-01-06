<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import { uiIsAuthenticated, uiProfilePictureUrl, uiUserName, uiUserRole } from '$lib/stores/ui';
	import type { GroupType } from '$lib/types';

	let user = null;
	let name: string = $state('');
	let description: string = $state('');
	let groupType: GroupType = $state('TEACHER_STUDENT');

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

	async function createGroup() {
		if (name === '' || description === '') {
			alert('Minden mezőt kötelező kitölteni!');
			return;
		}

		try {
			await api.post(
				'/groups/create',
				{ name, description, teachersOnly: groupType === 'TEACHER_ONLY' },
				{ headers: { 'Content-Type': 'application/json' } }
			);

			alert('Csoport létrehozva!');
			goto('/user-profile');
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Csoport létrehozása sikertelen!');
		}
	}

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		createGroup();
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
				<h1>Új csoport létrehozása</h1>

				<form on:submit={onSubmit}>
					<input type="text" bind:value={name} placeholder="Csoport neve" />
					<textarea bind:value={description} placeholder="Csoport leírása"></textarea>

					<select bind:value={groupType}>
						<option value="TEACHER_STUDENT">Tanár–diák csoport</option>
						<option value="TEACHER_ONLY">Csak tanárokból álló csoport</option>
					</select>

					<br />
					<button class="btn btn-wide" type="submit">Csoport létrehozása</button>
				</form>
			</div>
		</div>
	</main>
</div>
