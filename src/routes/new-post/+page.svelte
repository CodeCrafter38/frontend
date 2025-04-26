<script lang="ts">
	import api from '$lib/api';

	let title = '';
	let content = '';
	let user_id = '';
	let group_id = '';

	async function createPost() {
		try {
			const res = await api.post('/posts', { title, content, user_id, group_id });
			alert('Post created succesfully');
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Failed to create post');
		}
	}
</script>

<a href="/home" class="btn">Home</a>
<a href="/logout" class="btn">Logout</a>
<div class="newPost">
	<input bind:value={title} placeholder="Title" />
	<textarea bind:value={content} placeholder="Content"></textarea>
	<button on:click={createPost}>Create Post</button>
</div>
