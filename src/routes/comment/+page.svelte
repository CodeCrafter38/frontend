<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let content: string = $state('');
	let userName: string = '';

	const postId = page.url.searchParams.get('postId');

	onMount(async () => {
		try {
			const user = await getUserStatus();
			console.log('user in comment route page: ', user);
			userName = user.data.user;
			console.log('userName in comment route page: ', userName);
		} catch (e: any) {
			alert('You are not authenticated');
			goto('/login');
		}
	});

	async function createComment() {
		if (content == '') {
			alert('A komment tartalmát kötelező kitölteni!');
		} else {
			try {
				const res = await api.post('/comments', { postId, userName, content });
				alert('Sikeres komment beküldés');
				goto('/home');
			} catch (e: any) {
				alert(e.response?.data?.msg || 'Sikertelen komment beküldés!');
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
</script>

<a href="/home" class="btn">Kezdőlap</a>
<button class="btn" onclick={onLogout}>Kijelentkezés</button>
<div class="newPost">
	<textarea bind:value={content} placeholder="Komment tartalma"></textarea>
	<br />
	<button class="btn" onclick={createComment}>Komment beküldése</button>
</div>
