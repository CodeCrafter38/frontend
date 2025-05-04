<script lang="ts">
	import { goto } from '$app/navigation';
	import { logout } from '$lib/logout';
	import { getUserStatus } from '$lib/auth';
	import { onMount } from 'svelte';
	import api from '$lib/api';

	let posts: any = [];

	onMount(async () => {
		try {
			const user = await getUserStatus();
			console.log('lofasz in home route page svelte: ', user);
			const res = await api.get('/posts');
			posts = res.data;
			console.log('posts in home page: ', posts);
		} catch (e: any) {
			alert('You are not authenticated');
			goto('/login');
		}
	});

	async function onLogout() {
		try {
			await logout();
		} catch {
			alert('Logout failed');
		}
	}
</script>

<a href="/new-post" class="btn">New post</a>
<button class="btn" on:click={onLogout}>Logout</button>
<h1>Blog Posts</h1>
<ul>
	{#each posts as post}
		<li>{post.title}<br />{post.content}</li>
		<!-- <a href=`/comment?post=$post.id` class="btn">Add comment</a> -->
		<br />
		<a href="/comment" class="btn">Add comment</a>
		<br />
		<br />
	{/each}
</ul>
