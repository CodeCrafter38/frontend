<script lang="ts">
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import { getUserStatus } from '$lib/auth';
	import { logout } from '$lib/logout';
	import { onMount } from 'svelte';
	import MultiSelect from '$lib/components/MultiSelect.svelte';
	import { uiIsAuthenticated, uiProfilePictureUrl, uiUserName, uiUserRole } from '$lib/stores/ui';
	import type { Group, GroupType } from '$lib/types';

	const ALLOWED_EXTENSIONS = ['.doc', '.docx', '.xls', '.xlsx'];
	const MAX_TOTAL_SIZE_MB = 100;
	const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

	let user = null;
	let title: string = $state('');
	let content: string = $state('');
	let labels: string[] = $state([]);
	let files: File[] = $state([]);
	let fileError: string = $state('');
	let fileWarning: string = $state('');
	let videoLink: string = $state('');
	let userName: string = $state('');
	let userRole: string = $state('');
	let availableGroups: Group[] = $state([]);
	let selectedGroups: Group[] = $state([]);
	let isPublic = $state(false);
	let groupType: GroupType = $state('TEACHER_STUDENT');
	let isUserLoaded = $state(false);

	onMount(async () => {
		user = await getUserStatus();
		if (!user) {
			goto('/login');
			return;
		}

		userName = user.username;
		userRole = user.role;
		isUserLoaded = true;

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
	});

	async function createPost() {
		if (userRole === 'STUDENT') isPublic = true;

		const totalSize = getTotalSize(files);
		if (totalSize > MAX_TOTAL_SIZE_BYTES) {
			const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
			alert(
				`A csatolt fájlok összmérete (${totalMB} MB) meghaladja a megengedett ${MAX_TOTAL_SIZE_MB} MB-ot. Törölj néhány fájlt.`
			);
			return;
		}

		if (title === '' || content === '') {
			alert('A címet és a tartalmat kötelező kitölteni!');
			return;
		}

		if (selectedGroups.length == 0 && !isPublic) {
			alert('Ha nem publikus a poszt, akkor legalább egy csoportot ki kell választani!');
			return;
		}

		try {
			const formData = new FormData();
			formData.append('title', title);
			formData.append('content', content);
			formData.append('isPublic', JSON.stringify(isPublic));
			formData.append('labels', JSON.stringify(labels));
			formData.append('userName', userName);
			formData.append('videoLink', videoLink);
			formData.append('groupType', groupType);

			files.forEach((file) => formData.append('files', file));
			selectedGroups.forEach((group) => formData.append('selectedGroupIds', group.id.toString()));

			await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

			alert('Poszt létrehozva');
			goto('/home');
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Poszt létrehozása sikertelen!');
		}
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

	function toggleGroup(item: Group) {
		if (selectedGroups.includes(item)) selectedGroups = selectedGroups.filter((i) => i !== item);
		else selectedGroups = [...selectedGroups, item];
	}

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (!input || !input.files) return;

		const newSelection = Array.from(input.files);

		const invalidNew = validateFiles(newSelection);

		const validNew = newSelection.filter((file) => {
			const mimetype = file.type || '';
			const isImage = mimetype.startsWith('image/');

			const dotIndex = file.name.lastIndexOf('.');
			const ext = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '';
			const isAllowedDoc = ALLOWED_EXTENSIONS.includes(ext);

			return isImage || isAllowedDoc;
		});

		files = mergeFiles(files, validNew);
		updateFileErrorMessage();

		if (invalidNew.length > 0) {
			fileWarning =
				'Az alábbi fájl(ok) típusa nem engedélyezett, ezért nem kerültek csatolásra: ' +
				invalidNew.join(', ');
		} else {
			fileWarning = '';
		}

		input.value = '';
	}

	function getTotalSize(fileArray: File[]): number {
		return fileArray.reduce((sum, f) => sum + f.size, 0);
	}

	function updateFileErrorMessage() {
		const totalSize = getTotalSize(files);
		if (totalSize > MAX_TOTAL_SIZE_BYTES) {
			const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
			fileError = `A csatolt fájlok összmérete (${totalMB} MB) meghaladja a megengedett ${MAX_TOTAL_SIZE_MB} MB-ot. Törölj néhány fájlt.`;
		} else {
			fileError = '';
		}
	}

	function mergeFiles(existing: File[], incoming: File[]): File[] {
		const map = new Map<string, File>();

		for (const f of existing) map.set(`${f.name}-${f.size}-${f.lastModified}`, f);
		for (const f of incoming) {
			const key = `${f.name}-${f.size}-${f.lastModified}`;
			if (!map.has(key)) map.set(key, f);
		}
		return Array.from(map.values());
	}

	function validateFiles(fileList: FileList | File[]): string[] {
		const invalid: string[] = [];
		for (const file of Array.from(fileList)) {
			const mimetype = file.type || '';
			const isImage = mimetype.startsWith('image/');

			const dotIndex = file.name.lastIndexOf('.');
			const ext = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '';
			const isAllowedDoc = ALLOWED_EXTENSIONS.includes(ext);

			if (!isImage && !isAllowedDoc) invalid.push(file.name);
		}
		return invalid;
	}

	function removeFile(fileToRemove: File) {
		files = files.filter((f) => f !== fileToRemove);
		updateFileErrorMessage();
	}
</script>

<div class="page-container">
	<aside class="sidebar">
		<button class="btn" on:click={onHome}>Kezdőlap</button>
		<button class="btn" on:click={onLogout}>Kijelentkezés</button>
	</aside>

	<main class="content-pane">
		<div class="content-inner">
			<div class="form-card">
				<h1>Új poszt létrehozása</h1>

				<form on:submit|preventDefault={createPost}>
					<input type="text" bind:value={title} placeholder="Cím" />
					<textarea bind:value={content} placeholder="Tartalom"></textarea>

					<MultiSelect bind:tags={labels} placeholder="Címke hozzáadása..." />

					<input
						id="img"
						type="file"
						multiple
						accept="image/*,.doc,.docx,.xls,.xlsx"
						style="display:none;"
						on:change={onFileChange}
					/>
					<label class="btn" for="img">Fájlok kiválasztása</label>

					<span class="file-label-text">
						{#if files.length}
							{#each files as file}
								<span class="file-chip">
									{file.name}
									<button type="button" class="file-remove" on:click={() => removeFile(file)}
										>×</button
									>
								</span>
							{/each}
						{:else}
							Nincs fájl kiválasztva
						{/if}
					</span>

					{#if fileWarning}
						<p class="file-warning">{fileWarning}</p>
					{/if}

					{#if fileError}
						<p class="file-error">{fileError}</p>
					{/if}

					<input type="url" bind:value={videoLink} placeholder="Youtube link helye" />

					{#if !isUserLoaded}
						<p>Betöltés...</p>
					{:else if userRole === 'STUDENT'}
						<p>A létrehozott poszt publikus lesz.</p>
					{:else if availableGroups.length}
						<label style="display:flex; gap: 0.5rem; align-items:center;">
							<input type="checkbox" bind:checked={isPublic} />
							Nyilvános
						</label>

						<div style="margin-top: 0.75rem;">Válaszd ki a csoportokat:</div>

						{#each availableGroups as availableGroup}
							<label style="display:flex; gap: 0.5rem; align-items:center; margin: 0.25rem 0;">
								<input
									type="checkbox"
									disabled={isPublic}
									checked={selectedGroups.includes(availableGroup)}
									on:change={() => toggleGroup(availableGroup)}
								/>
								{availableGroup.name}
							</label>
						{/each}

						<p>
							Kiválasztott csoportok:
							{#each selectedGroups as g, i}
								{g.name}{i < selectedGroups.length - 1 ? ', ' : ''}
							{/each}
						</p>
					{:else}
						<p>Nem vagy benne egyik csoportban sem, csak nyilvános posztot tudsz létrehozni.</p>
					{/if}

					{#if userRole !== 'STUDENT'}
						<div class="fieldset">
							<div style="margin-bottom: 0.5rem;">Ki kommentelhet a poszthoz:</div>
							<select bind:value={groupType}>
								<option value="TEACHER_STUDENT">Tanárok és diákok is</option>
								<option value="TEACHER_ONLY">Csak tanárok</option>
							</select>
						</div>
					{/if}

					<button class="btn btn-wide" type="submit">Poszt létrehozása</button>
				</form>
			</div>
		</div>
	</main>
</div>
