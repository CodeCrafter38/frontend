import api from './api';

export const getUserStatus = async () => {
	const res = await api.get('/me');

	// get the user token from the cookie
	console.log('res in auth.ts: ', res);

	return res ?? null;
};

// export const authenticateUser = async () => {
// 	// get the cookies from the request
// 	const { cookies } = event;
// 	console.log('cookies in auth.ts: ', cookies);

// 	// get the user token from the cookie
// 	const userToken = cookies.get('auth');
// 	console.log('userToken in auth.ts: ', userToken);

// 	// if the user token is not valid, return null
// 	// this is where you would check the user token against your database
// 	// to see if it is valid and return the user object
// 	const res = await api.get('/me');

// 	return res ?? null;
// };
