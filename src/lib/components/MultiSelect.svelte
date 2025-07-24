<script lang="ts">
	import { Trash2 } from 'lucide-svelte';

	export let tags: string[] = [];
	let inputValue: string = '';
	let error: string = '';

	function addTag() {
		const value = inputValue.trim();
		if (!value) {
			return;
		}

		if (tags.includes(value)) {
			error = 'Már létezik ilyen nevű címke.';
			return;
		}

		tags = [...tags, value];
		inputValue = '';
		error = '';
	}

	function removeTag(index: number) {
		tags = tags.filter((_, i) => i !== index);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addTag();
		}
	}

	function handleBlur() {
		addTag();
	}
</script>

<div class="multi-select">
	{#each tags as tag, i}
		<span class="tag">
			<span class="tag-label">{tag}</span>
			<button type="button" aria-label="Törlés" on:click={() => removeTag(i)} class="remove-btn">
				<Trash2 size={16} />
			</button>
		</span>
	{/each}
	<input
		type="text"
		bind:value={inputValue}
		on:keydown={handleKeyDown}
		on:blur={handleBlur}
		placeholder="Címke hozzáadása..."
	/>
</div>

{#if error}
	<div class="error">{error}</div>
{/if}

<style>
	@import '/src/routes/new_post_comment.css';
	.multi-select {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: start;
		padding: 4px;
		border-radius: 4px;
	}
	.tag {
		display: flex;
		border: 2px solid var(--color-border);
		/* background: #e0e0e0; */
		border-radius: 4px;
		padding: 2px 6px;
		font-size: 0.9rem;
		height: 2rem;
		align-items: center;
	}
	.tag-label {
		user-select: none;
	}
	.remove-btn {
		background: none;
		border: none;
		margin-left: 4px;
		cursor: pointer;
		padding: 2px;
		display: flex;
		align-items: center;
		color: #f96c06;
	}
	.remove-btn svg {
		display: block;
	}
	.multi-select input {
		/* border: none; */
		/* outline: none; */
		flex: 1;
		min-width: 100px;
		/* font-size: 1rem; */
		/* padding: 4px; */
	}
	.error {
		color: red;
		margin-top: 4px;
		font-size: 0.9rem;
	}
</style>
