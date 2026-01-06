<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { getUserStatus } from '$lib/auth';
	import { onMount } from 'svelte';
	import api from '$lib/api';
	import { uiIsAuthenticated, uiProfilePictureUrl, uiUserName, uiUserRole } from '$lib/stores/ui';
	import type { Group, mapGroupsToPosts } from '$lib/types';

	let user = null;
	let posts: any = $state([]);
	let userGroups: Group[] = $state([]);
	let groupIdsWithPostIds: mapGroupsToPosts[] = [];
	let userName: string = $state('');
	let userRole: string = $state('');
	let profilePicture: any = $state(null);

	let searchTerm: string = $state('');
	let selectedGroups: number[] = $state([]);
	let now = $state(Date.now());

	setInterval(() => {
		now = Date.now();
	}, 1000);

	onMount(async () => {
		user = await getUserStatus();
		if (!user) {
			goto('/login');
			return;
		}

		userName = user.username;
		userRole = user.role;
		profilePicture = user.profilePicture;

		uiIsAuthenticated.set(true);
		uiUserName.set(userName);
		uiUserRole.set(userRole);

		if (profilePicture?.filename) {
			uiProfilePictureUrl.set(
				`http://localhost:4000/api/files/profile-picture?filename=${profilePicture.filename}`
			);
		} else {
			uiProfilePictureUrl.set(null);
		}

		loadPosts();
	});

	const loadPosts = async () => {
		const fetchedPosts = await api.get(`/posts?username=${userName}`);
		const postsAndUserGroups = fetchedPosts.data;
		posts = postsAndUserGroups.readyPosts;
		userGroups = postsAndUserGroups.groupsOfUser;
		groupIdsWithPostIds = postsAndUserGroups.groupIdsWithPostIds;
	};

	async function onLogout() {
		try {
			await api.post('/logout');
			uiIsAuthenticated.set(false);
			uiProfilePictureUrl.set(null);
			uiUserName.set('');
			uiUserRole.set('');
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
		if (commentDeleted.status === 204) loadPosts();
		else alert('A kommentet már nem lehet törölni!');
	}

	function searchInPosts(post: any, termRaw: string) {
		if (!termRaw) return true;
		const term = termRaw.trim().toLowerCase();
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

<div class="page-container">
	<aside class="sidebar">
		<div class="sidebar-title">Üdv a Nexusban, {userName}!</div>
		<p>Itt megtekintheted a számodra látható posztokat és hozzászólhatsz.</p>

		<button class="btn" onclick={onProfilePage}>Felhasználói profil</button>
		<button class="btn" onclick={onNewPost}>Új poszt</button>
		<button class="btn" onclick={onLogout}>Kijelentkezés</button>
	</aside>

	<main class="content">
		<div class="content-inner">
			<h1>Posztok</h1>

			<div class="search-row">
				<input
					type="text"
					placeholder="Keresés cím, szöveg vagy címke alapján"
					bind:value={searchTerm}
					class="search-input"
				/>
			</div>

			{#if userGroups.length > 0}
				<h3>Szűrés csoportok alapján</h3>
				<div class="group-filters">
					{#each userGroups as group}
						<label class="filter-item">
							<input type="checkbox" bind:group={selectedGroups} value={group.id} />
							<span>{group.name}</span>
						</label>
					{/each}
				</div>
			{/if}

			{#if posts.length === 0}
				<p>Még nincsenek posztok.</p>
			{:else}
				{#each posts.filter((post: any) => searchInPosts(post, searchTerm) && filterByGroups(post, selectedGroups)) as post}
					<article class="post">
						<h3>{post.title}</h3>

						<div class="post-meta">
							<strong>Szerző: {post.username}</strong>
							<div>
								{post.created_at.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}).*$/, '$1 $2')}
							</div>
						</div>

						<div class="post-content">{post.content}</div>

						{#if post.video_link}
							<p>
								<a href={post.video_link} target="_blank" rel="noopener noreferrer">
									{post.video_link}
								</a>
							</p>
						{/if}

						{#if post.files !== null && post.files.length > 0}
							<strong>Fájlok:</strong>
							<br /><br />
							{#each post.files as file}
								{#if file.mimetype?.startsWith('image/')}
									<img
										src={`http://localhost:4000/api/files?filename=${file.filename}`}
										alt="Kép"
										width="200"
										style="margin-bottom: 20px;"
									/>
									<br />
								{:else}
									<a
										href={`http://localhost:4000/api/files?filename=${file.filename}`}
										target="_blank"
										rel="noopener noreferrer">{file.filename}</a
									>
									<br /><br />
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
									<li class="comment-item">
										<div class="comment-meta">
											<strong>Szerző: {comment.username}</strong>
											<div>
												{comment.created_at.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}).*$/, '$1')}
											</div>
										</div>

										<div>{comment.content}</div>

										{#if now - new Date(comment.created_at).getTime() < 60000 || userRole === 'ADMIN'}
											<div style="display:flex; justify-content:flex-end; margin-top: 0.5rem;">
												<button class="btn btn-sm" onclick={() => onDeleteComment(comment.id)}>
													Komment törlése
												</button>
											</div>
										{/if}
									</li>
								{/each}
							</ul>
						{:else}
							<em>Még nincsenek kommentek.</em>
						{/if}

						<br />

						{#if (userRole !== 'STUDENT' && post.teachers_only === 1) || post.teachers_only === 0}
							<button class="btn" onclick={() => onAddComment(post.id)}>Hozzászólok</button>
						{/if}

						{#if userRole === 'ADMIN'}
							<button class="btn" style="margin-left: 10px;" onclick={() => onDeletePost(post.id)}>
								Poszt törlése
							</button>
						{/if}
					</article>
				{/each}
			{/if}
		</div>
	</main>
</div>
