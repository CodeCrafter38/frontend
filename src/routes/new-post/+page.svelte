<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';

	let title: string = $state('');
	let content: string = $state('');
	let userName: string = '';
	let groupIds: number[] = $state([]);
	let selectedGroups: number[] = $state([]);
	let isPublic = $state(false);

	onMount(async () => {
		try {
			const user = await getUserStatus();
			console.log('user in new-post route page: ', user);
			userName = user.data.user;
			console.log('userName in new-post route page: ', userName);
		} catch (e: any) {
			alert('You are not authenticated');
			goto('/login');
		}
		try {
			const groupsOfUser = await api.get(`/groups/ofUser?username=${userName}`);
			groupsOfUser.data.forEach((group: any) => {
				groupIds.push(group.group_id);
			});
		} catch (e: any) {
			alert('Unable to retrieve available groups of user');
		}
	});

	async function createPost() {
		if (title == '' || content == '') {
			alert('A címet és a tartalmat kötelező kitölteni!');
		} else {
			try {
				const res = await api.post('/posts', {
					title,
					content,
					userName,
					isPublic,
					selectedGroups
				});
				alert('Poszt létrehozva');
				goto('/home');
			} catch (e: any) {
				alert(e.response?.data?.msg || 'Poszt létrehozása sikertelen!');
			}
		}
	}

	async function onLogout() {
		try {
			await logout();
		} catch {
			alert('Sikertelen kijelentkezés!');
		}
	}

	function toggleGroup(item: any) {
		if (selectedGroups.includes(item)) {
			selectedGroups = selectedGroups.filter((i) => i !== item);
		} else {
			selectedGroups = [...selectedGroups, item];
		}
	}
	function toggleVisibility() {
		isPublic = !isPublic;
	}
</script>

<a href="/home" class="btn">Kezdőlap</a>
<button class="btn" onclick={onLogout}>Kijelentkezés</button>
<div class="logo">Új poszt létrehozása</div>
<div class="newPost">
	<input bind:value={title} placeholder="Cím" />
	<br />
	<textarea bind:value={content} placeholder="Tartalom"></textarea>
	<br />
	<label>
		<input
			type="checkbox"
			id="visibility"
			name="visibility"
			value="public"
			onchange={() => toggleVisibility}
			bind:checked={isPublic}
		/>
		Nyilvános
	</label>
	<br />
	<div>Válaszd ki a csoportokat, amelyekbe szeretnéd beküldeni a posztot</div>
	{#each groupIds as groupId}
		<label>
			<input
				type="checkbox"
				value={groupId}
				onchange={() => toggleGroup(groupId)}
				checked={selectedGroups.includes(groupId)}
			/>
			{groupId}
		</label><br />
	{/each}
	<p>Kiválasztott csoportok: {selectedGroups.join(', ')}</p>
	<button class="btn" onclick={createPost}>Poszt létrehozása</button>
</div>
