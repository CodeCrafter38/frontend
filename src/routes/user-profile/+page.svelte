<!-- user profile page -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/Nexus_white.png';
	import MultiSelect from '$lib/components/MultiSelect.svelte';

	type Group = {
		id: number;
		name: string;
		description?: string;
		created_at: any;
		teachers_only: number;
	};

	type User = {
		id: number;
		username: string;
		role: string;
	};

	type GroupMapping = {
		groupId: number;
		groupName: string;
		description?: string;
		created_at: any;
		teachers_only: number;
		members: User[];
	};

	let user = null;
	let userName: string = $state('');
	let userRole: string = $state('');
	let availableGroups: Group[] = $state([]);
	let groupMappings: GroupMapping[] = $state([]);
	let newMembersByGroup = $state<Record<string, string[]>>({});
	let theme: string = $state('light');

	onMount(async () => {
		// Felhasználó authentikáció ellenőrzése
		user = await getUserStatus();
		if (!user) {
			goto('/login');
		}
		userName = user.username;
		userRole = user.role;

		// Téma betöltése a localStorage-ból
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		try {
			if (userRole === 'ADMIN') {
				const groupsOfAdmin = await api.get('/groups/all');
				groupsOfAdmin.data.forEach((group: any) => {
					availableGroups.push(group);
				});
				console.log('availableGroups: ', availableGroups);
			} else {
				const groupsOfUser = await api.get(`/groups/ofUser?username=${userName}`);
				groupsOfUser.data.forEach((group: any) => {
					availableGroups.push(group);
				});
			}
			console.log('availableGroups: ', availableGroups);
		} catch {
			alert('Csoportok lekérdezése sikertelen!');
		}

		const mappings = await Promise.all(
			availableGroups.map(async (group: Group) => {
				const usersOfGroup = await api.get(`/users/ofGroup?groupId=${group.id}`);
				return {
					groupId: group.id,
					groupName: group.name,
					description: group.description,
					created_at: group.created_at,
					teachers_only: group.teachers_only,
					members: usersOfGroup.data as User[]
				} satisfies GroupMapping;
			})
		);

		groupMappings = mappings.sort(sortByDateDesc);
		newMembersByGroup = Object.fromEntries(groupMappings.map((g) => [g.groupName, []]));
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		updateBodyClass();
	}

	function updateBodyClass() {
		document.body.classList.remove('light', 'dark');
		document.body.classList.add(theme);
	}

	async function addUsersToGroup(groupName: string, usersToAdd: string[]) {
		// duplikáció ellenőrzés (a megadott userek közül tag-e már valaki a csoportban)
		const normalizedUsersToAdd = usersToAdd.map((user) => user.trim()).filter(Boolean);

		const mapping = groupMappings.find((group) => group.groupName === groupName);
		if (mapping) {
			const existingMembers = new Set(mapping.members.map((member) => member.username));
			const alreadyInGroup = normalizedUsersToAdd.filter((user) => existingMembers.has(user));

			if (alreadyInGroup.length > 0) {
				alert(`Ezek a felhasználók már a csoport tagjai: ${alreadyInGroup.join(', ')}`);
				return;
			}
		}

		if (groupName === '' || usersToAdd.length === 0) {
			alert('Kötelező csoportnevet és új tagot megadni!');
		} else {
			try {
				await api.post(
					'/groups/users-to-group',
					{
						groupName: groupName,
						usersToAdd: usersToAdd
					},
					{
						headers: {
							'Content-Type': 'application/json'
						}
					}
				);

				alert('Felhasználók csoporthoz rendelése sikeres!');
				// newMembersByGroupArray[groupIndex].members = [];
				newMembersByGroup[groupName] = [];
				await refreshGroupMembers();
			} catch (e: any) {
				alert(e.response?.data?.msg || 'Felhasználók csoporthoz rendelése sikertelen!');
			}
		}
	}

	// TODO: use-case: ha törlünk egy csoportot, akkor ha volt az adott csoporthoz poszt létrehozva,
	// akkor törlődik ugyan a hozzárendelés a user_groups és a post_groups táblákból, de a poszt megmarad
	// privát posztként és az admin és a tanárok látják - jó-e így?
	async function deleteGroup(groupName: string) {
		try {
			await api.delete(`/groups?groupName=${groupName}`);
			alert('Csoport törlése sikeres!');
			groupMappings.length = 0;
			availableGroups = availableGroups.filter((group) => group.name !== groupName);
			newMembersByGroup = Object.fromEntries(groupMappings.map((g) => [g.groupName, []]));
			await refreshGroupMembers();
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Csoport törlése sikertelen!');
		}
	}

	async function removeUserFromGroup(groupName: string, userId: number) {
		try {
			await api.delete(`/groups/users-from-group?groupName=${groupName}&userId=${userId}`);

			alert('Felhasználó eltávolítva a csoportból!');
			await refreshGroupMembers();
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Felhasználó eltávolítása a csoportból sikertelen!');
		}
	}

	async function refreshGroupMembers() {
		const mappings = await Promise.all(
			availableGroups.map(async (group: Group) => {
				const usersOfGroup = await api.get(`/users/ofGroup?groupId=${group.id}`);
				return {
					groupId: group.id,
					groupName: group.name,
					description: group.description,
					created_at: group.created_at,
					teachers_only: group.teachers_only,
					members: usersOfGroup.data as User[]
				} satisfies GroupMapping;
			})
		);

		groupMappings = mappings.sort(sortByDateDesc);

		for (const groupMapping of groupMappings) {
			if (!newMembersByGroup[groupMapping.groupName]) {
				newMembersByGroup[groupMapping.groupName] = [];
			}
		}
	}

	function sortByDateDesc(a: GroupMapping, b: GroupMapping) {
		const ta = a.created_at ? Date.parse(a.created_at) : 0;
		const tb = b.created_at ? Date.parse(b.created_at) : 0;
		return tb - ta;
	}

	async function onLogout() {
		try {
			await logout();
		} catch {
			alert('Sikertelen kijelentkezés!');
		}
	}

	function onHome() {
		goto('/home');
	}

	function onUserNameChange() {
		goto('/change-username');
	}

	function onPasswordChange() {
		goto('/change-password');
	}

	async function onCreateNewGroup() {
		goto('/new-group');
	}

	async function onUploadProfilePicture() {
		goto('/upload-profile-picture');
	}
</script>

<div class="page-container">
	<div class="sidebar">
		<div class="logo">
			<img src={logo} alt="Nexus logo" />
		</div>
		<div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
			<!-- <img src="/profile-icon.png" alt="Profilkép" />
			<br /> -->
			<strong style="font-size: large">{userName} profil oldala</strong>
		</div>
		<button class="toggle-btn" on:click={toggleTheme}>
			{theme === 'light' ? '🌙' : '☀️'}
		</button>
		<button class="btn" on:click={onHome}>Kezdőlap</button>
		{#if userRole === 'ADMIN' || userRole === 'TEACHER'}
			<button class="btn" on:click={onCreateNewGroup}>Új csoport létrehozása</button>
		{/if}
		<button class="btn" on:click={onUserNameChange}>Felhasználónév módosítása</button>
		<button class="btn" on:click={onPasswordChange}>Jelszó módosítása</button>
		<button class="btn" on:click={onUploadProfilePicture}>Profilkép feltöltése</button>
		<button class="btn" on:click={onLogout}>Kijelentkezés</button>
	</div>

	<main class="content-pane">
		{#if userRole === 'ADMIN'}
			<h1>Összes csoport</h1>
		{:else}
			<h1>Csoportjaid</h1>
		{/if}
		{#if groupMappings.length > 0}
			{#each groupMappings as mapping (mapping.groupName)}
				<div class="post">
					<div style="display: flex; flex-direction: row;">
						<h3>{mapping.groupName}</h3>
						<div style="margin-left: auto; text-align: right;">
							<span style="font-weight: normal">Létrehozva:</span>
							{mapping.created_at.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}).*$/, '$1 $2')}
						</div>
					</div>
					{#if mapping.teachers_only === 1}
						<h4>Csak tanárok számára elérhető csoport</h4>
					{/if}
					<h4><span style="font-weight:normal">Mottó:</span> {mapping.description}</h4>
					<h4>
						{#if mapping.members.length === 0}
							<h4>Még nincsenek tagok a csoportban.</h4>
						{:else}
							<h4>Tagok:</h4>
							<ul
								class="comments"
								style="display: flex; flex-direction: column; margin-bottom: 10px;"
							>
								{#each mapping.members as member}
									{member.username}
									<li style="justify-content: flex-end; margin-left: auto;">
										{#if userRole === 'TEACHER' && member.username !== userName && member.role !== 'ADMIN'}
											<button
												class="btn"
												style="width: 70px"
												on:click={() => removeUserFromGroup(mapping.groupName, member.id)}
												>{member.username !== userName && 'Kidobás'}</button
											>
										{:else if userRole === 'ADMIN' && member.username !== userName}
											<button
												class="btn"
												style="width: 70px"
												on:click={() => removeUserFromGroup(mapping.groupName, member.id)}
												>{member.username !== userName && 'Kidobás'}</button
											>
										{/if}
									</li>
									<br />
								{/each}
							</ul>
						{/if}
						{#if userRole !== 'STUDENT'}
							<h4>Új tagok hozzáadásához írd be a lenti mezőbe az új tagok felhasználónevét:</h4>
							<MultiSelect
								bind:tags={newMembersByGroup[mapping.groupName]}
								placeholder="Új tagok hozzáadása..."
							/>
							<div style="display: flex; flex-direction: row;">
								<button
									class="btn"
									style="width: 30%"
									on:click={() =>
										addUsersToGroup(mapping.groupName, newMembersByGroup[mapping.groupName])}
									disabled={!newMembersByGroup[mapping.groupName]?.length}
								>
									Tag/tagok hozzáadása
								</button>
								{#if userRole == 'ADMIN'}
									<button
										class="btn"
										style="width: 30%; flex-direction: right; margin-left: auto;"
										on:click={() => {
											deleteGroup(mapping.groupName);
										}}>Csoport törlése</button
									>
								{/if}
							</div>
						{/if}
					</h4>
				</div>
			{/each}
		{:else}
			<h2>Nem vagy benne semmilyen csoportban, csak a publikus posztokat láthatod.</h2>
		{/if}
	</main>
</div>

<style>
	@import '../../app.css';
	@import '../new_post_comment.css';

	.content-pane h4 {
		margin-top: 1rem;
	}

	.comments li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.comments .btn {
		font-size: 0.75rem;
		padding: 0.4rem 0.6rem;
	}

	.logo span {
		font-size: 1.2rem;
		font-weight: bold;
	}
</style>
