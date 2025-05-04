// import { redirect } from '@sveltejs/kit';
// import type { Actions, PageServerLoad } from './$types';

// export const load: PageServerLoad = async ({ locals }) => {
// 	console.log('user in page server ts: ', locals.user);
// 	return {
// 		user: locals.user
// 	};
// };

// //TODO: replace with actual data
// export const actions: Actions = {
// 	login: async ({ cookies }) => {
// 		cookies.set('auth', 'usertoken', {
// 			path: '/',
// 			httpOnly: true,
// 			sameSite: 'strict',
// 			maxAge: 60 * 60 * 24 * 7 // 1 week
// 		});

// 		throw redirect(303, '/home');
// 	}
// };
