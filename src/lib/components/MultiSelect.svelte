<script lang="ts">
	// Svelte 5 – bindable prop
	let { tags = $bindable<string[]>([]), placeholder = '' } = $props();

	let input = $state('');

	function normalize(raw: string) {
		return raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	function addFromInput() {
		const parts = normalize(input);
		if (parts.length === 0) return;

		const next = [...tags];
		for (const p of parts) {
			if (!next.includes(p)) next.push(p);
		}
		tags = next;
		input = '';
	}

	function removeTag(idx: number) {
		tags = tags.filter((_, i) => i !== idx);
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addFromInput();
			return;
		}

		if (e.key === ',') {
			e.preventDefault();
			addFromInput();
			return;
		}
	}
</script>

<div class="multi-select" style="margin: 0.5rem 0 1rem 0;">
	<div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
		{#each tags as tag, i (tag)}
			<span class="file-chip">
				{tag}
				<button type="button" class="file-remove" onclick={() => removeTag(i)}>×</button>
			</span>
		{/each}
	</div>

	<input type="text" bind:value={input} {placeholder} onkeydown={onKeyDown} onblur={addFromInput} />
</div>
