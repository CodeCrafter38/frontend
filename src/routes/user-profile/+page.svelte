<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import MultiSelect from '$lib/components/MultiSelect.svelte';

	import { uiIsAuthenticated, uiProfilePictureUrl, uiUserName, uiUserRole } from '$lib/stores/ui';

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

	onMount(async () => {
		user = await getUserStatus();
		if (!user) {
			goto('/login');
			return;
		}

		userName = user.username;
		userRole = user.role;

		uiIsAuthenticated.set(true);
		uiUserName.set(userName);
		uiUserRole.set(userRole);

		if (user.profilePicture?.filename) {
			uiProfilePictureUrl.set(
				`http://localhost:4000/api/files/profile-picture?filename=${user.profilePicture.filename}`
			);
		} else {
			uiProfilePictureUrl.set(null);
		}

		try {
			if (userRole === 'ADMIN') {
				const groupsOfAdmin = await api.get('/groups/all');
				groupsOfAdmin.data.forEach((group: any) => availableGroups.push(group));
			} else {
				const groupsOfUser = await api.get(`/groups/ofUser?username=${userName}`);
				groupsOfUser.data.forEach((group: any) => availableGroups.push(group));
			}
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

	async function addUsersToGroup(groupName: string, usersToAdd: string[]) {
		const normalized = usersToAdd.map((u) => u.trim()).filter(Boolean);

		const mapping = groupMappings.find((g) => g.groupName === groupName);
		if (mapping) {
			const existing = new Set(mapping.members.map((m) => m.username));
			const already = normalized.filter((u) => existing.has(u));
			if (already.length > 0) {
				alert(`Ezek a felhasználók már a csoport tagjai: ${already.join(', ')}`);
				return;
			}
		}

		if (groupName === '' || usersToAdd.length === 0) {
			alert('Kötelező csoportnevet és új tagot megadni!');
			return;
		}

		try {
			await api.post(
				'/groups/users-to-group',
				{ groupName, usersToAdd },
				{ headers: { 'Content-Type': 'application/json' } }
			);

			alert('Felhasználók csoporthoz rendelése sikeres!');
			newMembersByGroup[groupName] = [];
			await refreshGroupMembers();
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Felhasználók csoporthoz rendelése sikertelen!');
		}
	}

	async function deleteGroup(groupName: string) {
		try {
			await api.delete(`/groups?groupName=${groupName}`);
			alert('Csoport törlése sikeres!');
			groupMappings.length = 0;
			availableGroups = availableGroups.filter((g) => g.name !== groupName);
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

		for (const g of groupMappings) {
			if (!newMembersByGroup[g.groupName]) newMembersByGroup[g.groupName] = [];
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
			uiIsAuthenticated.set(false);
			uiProfilePictureUrl.set(null);
			uiUserName.set('');
			uiUserRole.set('');
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
	<aside class="sidebar">
		<div class="sidebar-title">{userName} profil oldala</div>

		<button class="btn" onclick={onHome}>Kezdőlap</button>

		{#if userRole === 'ADMIN' || userRole === 'TEACHER'}
			<button class="btn" onclick={onCreateNewGroup}>Új csoport létrehozása</button>
		{/if}

		<button class="btn" onclick={onUserNameChange}>Felhasználónév módosítása</button>
		<button class="btn" onclick={onPasswordChange}>Jelszó módosítása</button>
		<button class="btn" onclick={onUploadProfilePicture}>Profilkép feltöltése</button>
		<button class="btn" onclick={onLogout}>Kijelentkezés</button>
	</aside>

	<main class="content-pane">
		<div class="content-inner">
			{#if userRole === 'ADMIN'}
				<h1>Összes csoport</h1>
			{:else}
				<h1>Csoportjaid</h1>
			{/if}

			{#if groupMappings.length > 0}
				{#each groupMappings as mapping (mapping.groupName)}
					<div class="post">
						<div class="post-meta">
							<h3>{mapping.groupName}</h3>
							<div>
								<span style="font-weight: normal">Létrehozva:</span>
								{mapping.created_at.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}).*$/, '$1 $2')}
							</div>
						</div>

						{#if mapping.teachers_only === 1}
							<h4>Csak tanárok számára elérhető csoport</h4>
						{/if}

						<h4><span style="font-weight:normal">Mottó:</span> {mapping.description}</h4>

						{#if mapping.members.length === 0}
							<h4>Még nincsenek tagok a csoportban.</h4>
						{:else}
							<h4>Tagok:</h4>
							<ul class="comments" style="list-style: none; padding-left: 0;">
								{#each mapping.members as member}
									<li
										style="display:flex; justify-content:space-between; gap: 1rem; margin: 0.25rem 0;"
									>
										<span>{member.username}</span>

										{#if userRole === 'TEACHER' && member.username !== userName && member.role !== 'ADMIN'}
											<button
												class="btn btn-sm"
												onclick={() => removeUserFromGroup(mapping.groupName, member.id)}
											>
												Kidobás
											</button>
										{:else if userRole === 'ADMIN' && member.username !== userName}
											<button
												class="btn btn-sm"
												onclick={() => removeUserFromGroup(mapping.groupName, member.id)}
											>
												Kidobás
											</button>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}

						{#if userRole !== 'STUDENT'}
							<h4>Új tagok hozzáadásához írd be a lenti mezőbe az új tagok felhasználónevét:</h4>

							<MultiSelect
								bind:tags={newMembersByGroup[mapping.groupName]}
								placeholder="Új tagok hozzáadása..."
							/>

							<div style="display:flex; gap: 1rem; margin-top: 0.75rem;">
								<button
									class="btn btn-wide"
									style="max-width: 320px;"
									onclick={() =>
										addUsersToGroup(mapping.groupName, newMembersByGroup[mapping.groupName])}
									disabled={!newMembersByGroup[mapping.groupName]?.length}
								>
									Tag/tagok hozzáadása
								</button>

								{#if userRole == 'ADMIN'}
									<button
										class="btn btn-wide"
										style="max-width: 220px; margin-left:auto;"
										onclick={() => deleteGroup(mapping.groupName)}
									>
										Csoport törlése
									</button>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			{:else}
				<h2>Nem vagy benne semmilyen csoportban, csak a publikus posztokat láthatod.</h2>
			{/if}
		</div>
	</main>
</div>
