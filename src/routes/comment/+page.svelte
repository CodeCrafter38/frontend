<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import { uiIsAuthenticated, uiProfilePictureUrl, uiUserName, uiUserRole } from '$lib/stores/ui';

	let user = null;
	let content: string = $state('');

	const postId = page.url.searchParams.get('postId');

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

	async function createComment() {
		if (content == '') {
			alert('A komment tartalmát kötelező kitölteni!');
			return;
		}

		try {
			await api.post('/comments', { postId, content });
			alert('Sikeres komment beküldés');
			goto('/home');
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Sikertelen komment beküldés!');
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
</script>

<div class="page-container">
	<aside class="sidebar">
		<button class="btn" on:click={onHome}>Kezdőlap</button>
		<button class="btn" on:click={onLogout}>Kijelentkezés</button>
	</aside>

	<main class="content-pane">
		<div class="content-inner">
			<div class="form-card">
				<h1>Komment hozzáadása</h1>
				<form on:submit|preventDefault={createComment}>
					<textarea bind:value={content} placeholder="Komment tartalma"></textarea>
					<br />
					<button class="btn btn-wide" type="submit">Komment beküldése</button>
				</form>
			</div>
		</div>
	</main>
</div>
