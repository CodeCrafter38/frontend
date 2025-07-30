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
	};

	type User = {
		id: number;
		username: string;
	};

	type GroupMapping = {
		groupName: string;
		description?: string;
		members: User[];
	};

	type NewMembersByGroup = {
		groupName: string;
		members: string[];
	};

	let userName: string = $state('');
	let userRole: string = $state('');
	let availableGroups: Group[] = $state([]);
	let groupMappings: GroupMapping[] = $state([]);
	let newMembersByGroupArray: NewMembersByGroup[] = $state([]);
	let theme = $state('light');

	onMount(async () => {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			theme = storedTheme;
		}
		updateBodyClass();

		try {
			const user = await getUserStatus();
			userName = user.data.user.username;
			userRole = user.data.user.role;
		} catch {
			alert('Sikertelen azonosítás!');
			goto('/login');
		}

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
		} catch {
			alert('Csoportok lekérdezése sikertelen!');
		}

		try {
			availableGroups.forEach(async (group: any) => {
				const usersOfGroup = await api.get(`/users/ofGroup?groupId=${group.id}`);
				console.log('usersOfGroup: ', usersOfGroup);
				groupMappings.push({
					groupName: group.name,
					description: group.description,
					members: usersOfGroup.data
				});
				console.log('groupMappings: ', groupMappings);
			});
		} catch {
			alert('Csoporthoz tartozó felhasználók lekérdezése sikertelen!');
		}

		createNewMemberArrays(availableGroups);
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

	async function addUsersToGroup(groupName: string, usersToAdd: string[], groupIndex: number) {
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
				newMembersByGroupArray[groupIndex].members = [];
				await refreshGroupMembers();
			} catch (e: any) {
				alert(e.response?.data?.msg || 'Felhasználók csoporthoz rendelése sikertelen!');
			}
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
		groupMappings.length = 0;
		availableGroups.forEach(async (group: any) => {
			const usersOfGroup = await api.get(`/users/ofGroup?groupId=${group.id}`);
			console.log('usersOfGroup: ', usersOfGroup);
			groupMappings.push({
				groupName: group.name,
				description: group.description,
				members: usersOfGroup.data
			});
			console.log('groupMappings after refresh: ', groupMappings);
		});
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

	function createNewMemberArrays(groups: Group[]) {
		groups.forEach((group) => {
			const newMemberObject = { groupName: group.name, members: [] };
			newMembersByGroupArray.push(newMemberObject);
		});
		console.log('newMembersByGroupArray: ', newMembersByGroupArray);
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
		<button class="btn" on:click={onCreateNewGroup}>Új csoport létrehozása</button>
		<button class="btn" on:click={onUserNameChange}>Felhasználónév módosítása</button>
		<button class="btn" on:click={onPasswordChange}>Jelszó módosítása</button>
		<button class="btn" on:click={onLogout}>Kijelentkezés</button>
	</div>

	<main class="content-pane">
		{#if userRole === 'ADMIN'}
			<h1>Összes csoport</h1>
		{:else}
			<h1>Csoportjaid</h1>
		{/if}
		{#each groupMappings as mapping, i}
			<div class="post">
				<h3>{mapping.groupName}</h3>
				<h4><span style="font-weight:normal">Mottó:</span> {mapping.description}</h4>
				{#if mapping.members.length === 0}
					<h4>Még nincsenek tagok a csoportban.</h4>
				{:else}
					<h4>Tagok:</h4>
					<ul class="comments" style="display: flex; flex-direction: column; margin-bottom: 10px;">
						{#each mapping.members as member}
							{member.username}
							<li style="justify-content: flex-end; margin-left: auto;">
								{#if userRole === 'TEACHER' || userRole === 'ADMIN'}
									<button
										class="btn"
										style="width: 70px"
										on:click={() => removeUserFromGroup(mapping.groupName, member.id)}
										>{member.username !== userName ? 'Kidobás' : 'Kilépés'}</button
									>
								{/if}
							</li>
							<br />
						{/each}
					</ul>
				{/if}
				<h4>Új tagok hozzáadásához írd be a lenti mezőbe az új tagok felhasználónevét:</h4>
				<MultiSelect
					bind:tags={newMembersByGroupArray[i].members}
					placeholder="Új tagok hozzáadása..."
				/>
				<button
					class="btn"
					style="width: 30%"
					on:click={() => addUsersToGroup(mapping.groupName, newMembersByGroupArray[i].members, i)}
					disabled={!newMembersByGroupArray[i].members?.length}
				>
					Tag/tagok hozzáadása
				</button>
			</div>
		{/each}
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
