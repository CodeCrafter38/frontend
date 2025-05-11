<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';

	type Group = {
		group_id: number;
		name: string;
	};

	let title: string = $state('');
	let content: string = $state('');
	let userName: string = '';
	let availableGroups: Group[] = $state([]);
	let selectedGroups: Group[] = $state([]);
	let isPublic = $state(false);

	$inspect(availableGroups, selectedGroups);

	onMount(async () => {
		try {
			const user = await getUserStatus();
			console.log('user a new-post route page-en: ', user);
			userName = user.data.user;
			console.log('userName a new-post route page-en: ', userName);
		} catch (e: any) {
			alert('Sikertelen azonosítás!');
			goto('/login');
		}
		try {
			const groupsOfUser = await api.get(`/groups/ofUser?username=${userName}`);
			console.log('groupsOfUser a new-post route page-en: ', groupsOfUser);
			groupsOfUser.data.forEach((group: any) => {
				availableGroups.push(group);
			});
		} catch (e: any) {
			alert('Bejelentkezett felhasználó csoportjainak lekérdezése sikertelen!');
		}
	});

	async function createPost() {
		if (title == '' || content == '') {
			alert('A címet és a tartalmat kötelező kitölteni!');
		} else {
			try {
				const selectedGroupIds: number[] = getSelectedGroupIds(selectedGroups);
				console.log('selectedGroupIds: ', selectedGroupIds);
				const res = await api.post('/posts', {
					title,
					content,
					userName,
					isPublic,
					selectedGroupIds
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

	function toggleGroup(item: Group) {
		if (selectedGroups.includes(item)) {
			selectedGroups = selectedGroups.filter((i) => i !== item);
		} else {
			selectedGroups = [...selectedGroups, item];
		}
	}

	function toggleVisibility() {
		isPublic = !isPublic;
	}

	function getSelectedGroupIds(groups: Group[]): number[] {
		const selectedGroupIds: number[] = [];
		groups.forEach((group) => {
			selectedGroupIds.push(group.group_id);
		});
		return selectedGroupIds;
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
	{#if availableGroups.length}
		<label>
			<input
				type="checkbox"
				id="visibility"
				name="visibility"
				onchange={() => toggleVisibility}
				bind:checked={isPublic}
			/>
			Nyilvános
		</label>
		<br />
		<div>Válaszd ki a csoportokat, amelyekbe szeretnéd beküldeni a posztot</div>
		<br />
		{#each availableGroups as availableGroup}
			<label>
				<input
					type="checkbox"
					value={availableGroup.group_id}
					onchange={() => toggleGroup(availableGroup)}
					checked={selectedGroups.includes(availableGroup)}
					disabled={isPublic}
				/>
				{availableGroup.name}
			</label><br />
		{/each}
		<p>
			Kiválasztott csoportok:
			{#each selectedGroups as selectedGroup, i}
				{#if i < selectedGroups.length - 1}
					{selectedGroup.name + ', '}
				{:else}
					{selectedGroup.name}
				{/if}
			{/each}
		</p>
	{:else}
		<div>Nem vagy benne semmilyen csoportban, ezért csak nyilvános posztot tudsz létrehozni</div>
		<br />
	{/if}
	<button class="btn" onclick={createPost}>Poszt létrehozása</button>
</div>
