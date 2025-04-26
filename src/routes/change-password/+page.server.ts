import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	//TODO: refactor
	const res = await fetch('http://localhost:4000/api/me', {
		credentials: 'include'
	});

	if (!res.ok) {
		throw redirect(302, '/login');
	}

	return {};
};
