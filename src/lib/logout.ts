import { goto, invalidate } from '$app/navigation';
import api from '$lib/api';

export async function logout() {
	await api.post('/logout');

	// Invalidate the layout load function (refetch user info)
	await invalidate(''); // '' (empty string) means "invalidate everything"
	goto('/login');
}
