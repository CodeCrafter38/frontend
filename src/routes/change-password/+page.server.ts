import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import api from '$lib/api';

// export const load: PageServerLoad = async () => {
// 	//TODO: refactor

// 	const res = await fetch('http://localhost:4000/api/me', {
// 		credentials: 'include'
// 	});
// 	// const res = await api.get('/me');

// 	console.log('res: ', res);

// 	if (res.status !== 200) {
// 		throw redirect(302, '/login');
// 	}

// 	return {};
// };
