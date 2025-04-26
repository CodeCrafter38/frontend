import { authenticateUser } from '$lib/auth';
import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Stage 1
	event.locals.user = authenticateUser(event);

	//TODO: fix logic
	// if (
	// 	event.url.pathname.startsWith('/home') ||
	// 	event.url.pathname.startsWith('/new-post') ||
	// 	event.url.pathname.startsWith('/change-password')
	// ) {
	// 	if (!event.locals.user) {
	// 		throw redirect(303, '/login');
	// 	}
	// }

	// Stage 2
	const response = await resolve(event);

	// Stage 3
	return response;
};
