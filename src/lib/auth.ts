import type { RequestEvent } from '@sveltejs/kit';

export const authenticateUser = (event: RequestEvent) => {
	// get the cookies from the request
	const { cookies } = event;

	// get the user token from the cookie
	const userToken = cookies.get('auth');

	// TODO: check user token against database
	// if it is valid then return the user object
	// if it is not valid, return null
	if (userToken === 'regularusertoken') {
		const user = {
			id: 1,
			username: 'user',
			email: 'user@example.com',
			role: 'USER'
		};
		return user;
	}
	if (userToken === 'adminusertoken') {
		const user = {
			id: 2,
			username: 'admin',
			email: 'admin@example.com',
			role: 'ADMIN'
		};
		return user;
	}

	return null;
};
