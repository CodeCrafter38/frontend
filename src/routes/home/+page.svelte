<!-- home page -->
<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { getUserStatus } from '$lib/auth';
	import { onMount } from 'svelte';
	import api from '$lib/api';
	import logo from '$lib/assets/Nexus_white.png';

	type Group = {
		id: number;
		name: string;
	};

	type mapGroupsToPosts = {
		groupId: number;
		postIds: number[];
	};

	let user = null;
	let posts: any = $state([]);
	let userGroups: Group[] = $state([]);
	let groupIdsWithPostIds: mapGroupsToPosts[] = [];
	let userName: string = $state('');
	let userRole: string = $state('');
	let theme: string = $state('light');
	let searchTerm: string = $state('');
	let selectedGroups: number[] = $state([]);
	let now = $state(Date.now());

	setInterval(() => {
		now = Date.now();
	}, 1000);

	onMount(async () => {
		// Felhasználó authentikáció ellenőrzése
		user = await getUserStatus();
		if (!user) {
			goto('/login');
		}
		userName = user.username;
		userRole = user.role;

		// Téma betöltése a localStorage-ból
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		loadPosts();
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
		const postsAndUserGroups = fetchedPosts.data;
		posts = postsAndUserGroups.readyPosts;
		userGroups = postsAndUserGroups.groupsOfUser;
		groupIdsWithPostIds = postsAndUserGroups.groupIdsWithPostIds;
		console.log('fetched posts:', fetchedPosts);
		console.log('Posts:', posts);
		console.log('userGroups:', userGroups);
		console.log('groupIdsWithPostIds:', groupIdsWithPostIds);
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

	function onProfilePage() {
		goto('/user-profile');
	}

	async function onDeletePost(id: number) {
		await api.delete(`/posts?id=${id}`);
		loadPosts();
	}

	async function onAddComment(id: number) {
		goto(`/comment?postId=${id}`);
	}

	async function onDeleteComment(id: number) {
		const commentDeleted = await api.delete(`/comments?id=${id}`);
		if (commentDeleted.status === 204) {
			loadPosts();
		} else {
			alert('A kommentet már nem lehet törölni!');
		}
	}

	function searchInPosts(post: any, searchTerm: string) {
		if (!searchTerm) return true;
		const term = searchTerm.trim().toLowerCase();
		if (!term) return true;
		return (
			post.title.toLowerCase().includes(term) ||
			post.content.toLowerCase().includes(term) ||
			(Array.isArray(post.labels) &&
				post.labels.some((label: any) => String(label).toLowerCase().includes(term))) ||
			(post.comments.length > 0 &&
				post.comments.some((comment: any) => comment.content.toLowerCase().includes(term)))
		);
	}

	function filterByGroups(post: any, selected: number[]) {
		if (!selected.length) return true;
		return groupIdsWithPostIds
			.filter((g) => selected.includes(g.groupId))
			.some((g) => g.postIds.includes(post.id));
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
			<button class="btn" on:click={onProfilePage}>Felhasználói profil</button>
			<button class="btn" on:click={onNewPost}>Új poszt</button>
			<button class="btn" on:click={onLogout}>Kijelentkezés</button>
		</div>
	</div>

	<div class="content">
		<h1>Posztok</h1>
		<br />
		<div class="search-container" style="margin-bottom: 1rem;">
			<input
				type="text"
				placeholder="Keresés cím, szöveg vagy címke alapján"
				bind:value={searchTerm}
				class="search-input"
				style="width: 300px; padding: 0.5rem; font-size: 1rem;"
			/>
		</div>
		{#if userGroups.length > 0}
			<h3>Szűrés csoportok alapján</h3>
			<div style="margin-bottom: 1rem; display: flex; gap: 2rem;">
				{#each userGroups as group}
					<label style="display: flex; align-items: center; gap: 0.3em;">
						<input type="checkbox" bind:group={selectedGroups} value={group.id} />
						<span>{group.name}</span>
					</label>
				{/each}
			</div>
			<br />
		{/if}
		{#if posts.length === 0}
			<p>Még nincsenek posztok.</p>
		{:else}
			<!-- {#each posts as post} -->
			{#each posts.filter((post: any) => searchInPosts(post, searchTerm) && filterByGroups(post, selectedGroups)) as post}
				<div class="post">
					<h3>{post.title}</h3>
					<strong>Szerző: {post.username}</strong>
					<div
						style="display: flex; justify-content: flex-end; margin-left: auto; margin-bottom: 10px;"
					>
						{post.created_at.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}).*$/, '$1 $2')}
					</div>
					<div class="post-content">{post.content}</div>
					{#if post.video_link}
						<!-- a megadott target és a rel attribútumok megakadályozzák, hogy a belinkelt oldal
						elérje a forrás oldal window objektumát, és visszatartják a hivatkozási információkat
						- biztonsági okokból van rá szükség -->
						<p>
							<a
								href={post.video_link}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-600 hover:underline"
							>
								{post.video_link}
							</a>
						</p>
					{/if}
					{#if post.files !== null && post.files.length > 0}
						<strong>Fájlok:</strong>
						<br />
						<br />
						{#each post.files as file}
							{#if file.mimetype?.startsWith('image/')}
								<img
									src={`http://localhost:4000/api/files?filename=${file.filename}`}
									alt="Kép"
									width="200"
								/>
								<br />
							{:else}
								<a
									href={`http://localhost:4000/api/files?filename=${file.filename}`}
									target="_blank">{file.filename}</a
								>
								<br />
								<br />
							{/if}
						{/each}
					{/if}
					{#if post.labels && post.labels.length}
						<p class="post-labels">
							{#each post.labels as label, i (label)}
								{`#${label}`}{i < post.labels.length - 1 ? ', ' : ''}
							{/each}
						</p>
					{/if}
					{#if post.comments.length > 0}
						<strong>Kommentek:</strong>
						<ul class="comments">
							{#each post.comments as comment}
								<div style="display: flex; flex-direction: column; margin-bottom: 10px;">
									<div style="justify-content: flex-start; margin-right: auto">
										<strong>Szerző: {comment.username}</strong>
									</div>
									<li style="display: flex; flex-direction: column; margin-bottom: 10px;">
										<div style="justify-content: flex-end; margin-left: auto; margin-bottom: 10px;">
											{comment.created_at.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}).*$/, '$1')}
										</div>
										{comment.content}
										{#if now - new Date(comment.created_at).getTime() < 60000 || userRole === 'ADMIN'}
											<button
												style="justify-content: flex-end; margin-left: auto;"
												class="btn"
												on:click={() => onDeleteComment(comment.id)}
											>
												Komment törlése
											</button>
										{/if}
									</li>
								</div>
							{/each}
						</ul>
					{:else}
						<br />
						<em>Még nincsenek kommentek.</em>
						<br />
					{/if}
					<br />
					<button class="btn" on:click={() => onAddComment(post.id)}> Hozzászólok </button>
					{#if userRole === 'ADMIN'}
						<button style="margin-left: 10px;" class="btn" on:click={() => onDeletePost(post.id)}>
							Poszt törlése
						</button>
					{/if}
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
		margin-bottom: 3rem;
	}

	.comments li {
		margin-bottom: 0.5rem;
	}

	.post-labels {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		color: #555;
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
