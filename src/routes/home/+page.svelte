<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { getUserStatus } from '$lib/auth';
	import { onMount } from 'svelte';
	import api from '$lib/api';

	let posts: any = [];
	let comments: any = [];

	onMount(async () => {
		try {
			const user = await getUserStatus();
			console.log('lofasz in home route page svelte: ', user);
			const fetchedPosts = await api.get('/posts');
			posts = fetchedPosts.data;
			console.log('posts in home page: ', fetchedPosts);
			const fetchedComments = await api.get('/comments');
			comments = fetchedComments.data;
			console.log('comments in home page: ', fetchedComments);
		} catch (e: any) {
			alert('You are not authenticated');
			goto('/login');
		}
	});

	// async function onAddComment(postId: number) {
	// 	goto(`/comment?postId=${postId}`);
	// }

	async function onLogout() {
		try {
			await api.post('/logout');
			// Invalidate the layout load function (refetch user info)
			await invalidate(''); // '' (empty string) means "invalidate everything"
			goto('/login');
			// 	await logout();
		} catch {
			alert('Logout failed');
		}
	}
</script>

<a href="/new-post" class="btn">New post</a>
<button class="btn" onclick={onLogout}>Logout</button>
<h1>Blog Posts</h1>
<ul>
	{#each posts as post}
		<li>{post.title}<br />{post.content}<br />Comments<br /></li>
		<br />
		<!-- <button class="btn" onclick={() => onAddComment(post.id)}>Add comment</button> -->
		<a href={`/comment?value=${post.id}`} class="btn">Add comment</a>
		<br />
		<br />
	{/each}
</ul>
