<script lang="ts">
	import '../app.css';
	// import { storable } from '../stores';

	let { children, data } = $props();
	// const store = storable(user);

	// $effect(() => {
	// 	const user = localStorage.getItem('content');
	// 	console.log('user in layout: ', user);
	// });

	// const user = localStorage.getItem('content');
	// console.log('user in layout: ', user);
</script>

<div class="logo">Nexus</div>
<div class="navbar"></div>

<!-- {#if user !== null}
	<p>Logged in as {user}</p>
{:else}
	<p>You are not logged in</p>
{/if} -->

{@render children()}
