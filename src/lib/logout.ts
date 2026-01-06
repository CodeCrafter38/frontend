import { goto, invalidate } from '$app/navigation';
import api from '$lib/api';

export async function logout() {
	await api.post('/logout');

	// Invalidáljuk a layout betöltés függvényt (újra lekérjük a user infót)
	// Üres string jelentése: invalidáljunk mindent
	await invalidate('');
	goto('/login');
}
