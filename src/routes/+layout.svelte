<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="logo">Nexus</div>
<div class="navbar"></div>

{@render children()}
