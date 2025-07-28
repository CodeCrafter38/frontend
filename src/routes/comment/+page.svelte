<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import logo from '$lib/assets/Nexus_white.png';

	let content: string = $state('');
	let userName: string = '';
	let theme = $state('light');

	const postId = page.url.searchParams.get('postId');

	onMount(async () => {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		try {
			const user = await getUserStatus();
			userName = user.data.user.username;
		} catch (e: any) {
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

	async function createComment() {
		if (content == '') {
			alert('A komment tartalmát kötelező kitölteni!');
		} else {
			try {
				await api.post('/comments', { postId, userName, content });
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
	<h1>Komment hozzáadása</h1>
	<form on:submit|preventDefault={createComment}>
		<textarea bind:value={content} placeholder="Komment tartalma"></textarea>
		<br />
		<button class="btn" type="submit">Komment beküldése</button>
	</form>
</div>

<style>
	@import '../new_post_comment.css';
</style>
