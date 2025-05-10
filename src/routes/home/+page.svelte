<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { getUserStatus } from '$lib/auth';
	import { onMount } from 'svelte';
	import api from '$lib/api';

	let posts: any = [];
	let userName = '';

	onMount(async () => {
		try {
			const user = await getUserStatus();
			console.log('user in home route page svelte: ', user);
			userName = user.data.user;
			loadPosts();
		} catch (e: any) {
			alert('You are not authenticated');
			goto('/login');
		}
	});

	const loadPosts = async () => {
		const fetchedPosts = await api.get(`/posts?username=${userName}`);
		posts = fetchedPosts.data;
		console.log('posts in home page: ', fetchedPosts);
	};

	async function onLogout() {
		try {
			await api.post('/logout');
			// Invalidate the layout load function (refetch user info)
			await invalidate(''); // '' (empty string) means "invalidate everything"
			goto('/login');
			// 	await logout();
		} catch {
			alert('Sikertelen kijelentkezés!');
		}
	}
</script>

<a href="/new-post" class="btn">Új poszt</a>
<button class="btn" onclick={onLogout}>Kijelentkezés</button>
<!-- <h1>Blog Posts</h1>
<ul> -->
<!-- {#each posts as post}
		<li>{post.title}<br />{post.content}<br />Comments:<br /></li>
		<br />
		<a href={`/comment?postId=${post.id}`} class="btn">Add comment</a>
		<br />
		<br />
	{/each} -->
<!-- </ul> -->

{#if posts.length === 0}
	<p>Még nincsenek posztok.</p>
{:else}
	{#each posts as post}
		<div class="post">
			<h2>{post.title}</h2>
			<div class="post-content">{post.content}</div>

			{#if post.comments.length !== 0}
				<strong>Kommentek:</strong>
				<ul class="comments">
					{#each post.comments as comment}
						<li>{comment.content}</li>
					{/each}
				</ul>
			{:else}
				<em>Még nincsenek kommentek.</em>
				<br />
				<br />
			{/if}
			<a href={`/comment?postId=${post.id}`} class="btn">Hozzászólok</a>
		</div>
	{/each}
{/if}
