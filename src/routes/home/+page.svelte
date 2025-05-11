<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { getUserStatus } from '$lib/auth';
	import { onMount } from 'svelte';
	import api from '$lib/api';
	import logo from '$lib/assets/Nexus_white.png';

	let posts: any = [];
	let userName = '';
	let theme = 'light';

	onMount(async () => {
		// Téma betöltése a localStorage-ból
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		// Felhasználó authentikáció ellenőrzése
		try {
			const user = await getUserStatus();
			userName = user.data.user;
			loadPosts();
		} catch {
			alert('You are not authenticated');
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

	const loadPosts = async () => {
		const fetchedPosts = await api.get(`/posts?username=${userName}`);
		posts = fetchedPosts.data;
	};

	async function onLogout() {
		try {
			await api.post('/logout');
			await invalidate('');
			goto('/login');
		} catch {
			alert('Sikertelen kijelentkezés!');
		}
	}

	function onNewPost() {
		goto('/new-post');
	}
</script>

<div class="top-right-bar">
	<div class="logo">
		<img src={logo} alt="Nexus logo" />
	</div>
	<button class="toggle-btn" on:click={toggleTheme}>
		{theme === 'light' ? '🌙' : '☀️'}
	</button>
</div>

<div class="page-container">
	<div class="sidebar">
		<h2>Üdv a Nexusban, {userName}!</h2>
		<p>Itt megtekintheted a számodra látható posztokat és hozzászólhatsz.</p>
		<div class="actions">
			<button class="btn" on:click={onNewPost}>Új poszt</button>
			<button class="btn" on:click={onLogout}>Kijelentkezés</button>
		</div>
	</div>

	<div class="content">
		<h1>Posztok</h1>
		<br />
		{#if posts.length === 0}
			<p>Még nincsenek posztok.</p>
		{:else}
			{#each posts as post}
				<div class="post">
					<h3>{post.title}</h3>
					<div class="post-content">{post.content}</div>

					{#if post.comments.length > 0}
						<strong>Kommentek:</strong>
						<ul class="comments">
							{#each post.comments as comment}
								<li>{comment.content}</li>
							{/each}
						</ul>
					{:else}
						<em>Még nincsenek kommentek.</em>
						<br />
					{/if}
					<br />
					<a href={`/comment?postId=${post.id}`} class="btn">Hozzászólok</a>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.page-container {
		display: flex;
		height: 100vh;
		width: 100%;
	}

	.sidebar {
		background-color: var(--bg-left);
		color: var(--text-left);
		padding: 2rem;
		width: 250px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.sidebar h2 {
		margin-top: 0;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
		width: 100%;
	}

	.actions .btn {
		width: 100%;
		background-color: var(--button-bg);
		color: white;
		border: none;
		padding: 0.75rem;
		cursor: pointer;
		border-radius: 4px;
		text-align: center;
		transition: background-color 0.3s;
	}

	body.light .sidebar .btn {
		background-color: var(--color-dark-blue); /* Dark blue button on orange background */
	}

	body.dark .sidebar .btn {
		background-color: var(--color-orange); /* Keep orange in dark mode */
	}

	.actions .btn:hover {
		opacity: 0.9;
	}

	.content {
		flex: 1;
		background-color: var(--bg-right);
		color: var(--text-right);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		overflow-y: auto;
	}

	.content h2 {
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.post {
		background-color: var(--input-bg);
		color: white;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 8px;
		width: 100%;
		max-width: 600px;
		text-align: left;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	.post h3 {
		margin-top: 0;
		color: var(--color-orange);
	}

	.post-content {
		margin: 0.5rem 0;
	}

	.comments {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin-top: 0.5rem;
	}

	.comments li {
		margin-bottom: 0.5rem;
	}

	@media (max-width: 800px) {
		.page-container {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			align-items: center;
			text-align: center;
		}

		.actions {
			flex-direction: row;
			justify-content: center;
			width: auto;
		}

		.content {
			padding: 1rem;
		}
	}
</style>
