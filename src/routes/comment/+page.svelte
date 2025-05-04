<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';

	let content: string = $state('');
	let userName: string = '';

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

	// async function createComment() {
	// 	try {
	// 		const res = await api.post('/comments', {});
	// 		alert('Comment created succesfully');
	// 		goto('/home');
	// 	} catch (e: any) {
	// 		alert(e.response?.data?.msg || 'Failed to create comment');
	// 	}
	// }

	async function onLogout() {
		try {
			await logout();
		} catch {
			alert('Logout failed');
		}
	}
</script>

<a href="/home" class="btn">Home</a>
<button class="btn" onclick={onLogout}>Logout</button>
<div class="newPost">
	<textarea bind:value={content} placeholder="Content"></textarea>
	<button onclick={() => {}}>Create comment</button>
</div>
