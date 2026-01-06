<!-- <script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

{@render children()} -->

<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import logo from '$lib/assets/Nexus_white.png';
	import sampleProfilePicture from '$lib/assets/sample_profile_picture.jpg';

	import { uiIsAuthenticated, uiProfilePictureUrl } from '$lib/stores/ui';

	let { children } = $props();

	let theme = $state<'light' | 'dark'>('light');

	function applyTheme(next: 'light' | 'dark') {
		theme = next;
		localStorage.setItem('theme', theme);
		document.body.classList.remove('light', 'dark');
		document.body.classList.add(theme);
	}

	function toggleTheme() {
		applyTheme(theme === 'light' ? 'dark' : 'light');
	}

	onMount(() => {
		const stored = localStorage.getItem('theme');
		if (stored === 'light' || stored === 'dark') {
			applyTheme(stored);
		} else {
			applyTheme('light');
		}
	});

	function isAuthPage() {
		const p = page.url.pathname;
		return p === '/login' || p === '/signup' || p === '/';
	}

	function onLogoClick() {
		if (!isAuthPage()) goto('/home');
	}

	function onProfileClick() {
		// ha nincs bejelentkezés, ne csináljon semmit
		if (!$uiIsAuthenticated) return;

		if ($uiProfilePictureUrl) goto('/user-profile');
		else goto('/upload-profile-picture');
	}
</script>

{#if isAuthPage()}
	<div class="top-right-bar">
		<div class="logo" onclick={onLogoClick}>
			<img src={logo} alt="Nexus logo" />
		</div>
		<button class="toggle-btn" onclick={toggleTheme}>
			{theme === 'light' ? '🌙' : '☀️'}
		</button>
	</div>

	<div class="auth-layout">
		{@render children()}
	</div>
{:else}
	<header class="app-header">
		<div class="header-left" onclick={onLogoClick} title="Kezdőlap">
			<img class="header-logo" src={logo} alt="Nexus logo" />
		</div>

		<div class="header-right">
			<button class="toggle-btn" onclick={toggleTheme}>
				{theme === 'light' ? '🌙' : '☀️'}
			</button>

			<div class="tooltip">
				<img
					class="profile-avatar"
					src={$uiProfilePictureUrl ?? sampleProfilePicture}
					alt="Profilkép"
					onclick={onProfileClick}
				/>
				{#if !$uiProfilePictureUrl}
					<span class="tooltiptext">Profilkép feltöltése</span>
				{/if}
			</div>
		</div>
	</header>

	<div class="app-main">
		{@render children()}
	</div>
{/if}
