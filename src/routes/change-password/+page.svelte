<script lang="ts">
	import api from '$lib/api';

	let oldPassword = '';
	let newPassword = '';

	async function changePassword() {
		try {
			const res = await api.post('/change-password', { oldPassword, newPassword });
			alert('Sikeres jelszó módosítás');
		} catch (e: any) {
			alert(e.response?.data?.msg || 'Sikertelen jelszó módosítás!');
		}
	}
</script>

<input type="password" bind:value={oldPassword} placeholder="Old Password" />
<input type="password" bind:value={newPassword} placeholder="New Password" />
<button on:click={changePassword}>Change password</button>
