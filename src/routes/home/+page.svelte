<script lang='ts'>
	import { goto } from "$app/navigation";
	import api from "$lib/api";
	import { onMount } from "svelte";

  let posts: any = [];

  onMount(async () => {
    try {
      const res = await api.get('/posts');
      posts = res.data;
    } catch (err) {
      console.error('Failed to load posts');
    }
  });

  async function logout() {
    try {
      await api.post('/logout');
      goto('/login');
    } catch {
      alert('Logout failed');
    }
  }
</script>

<a href="/new-post" class="btn">New post</a>
<button class="btn" on:click={logout}>Logout</button>
<h1>Blog Posts</h1>
<ul>
  {#each posts as post}
    <li>{post.title}<br>{post.content}</li>
    <br>
  {/each}
</ul>