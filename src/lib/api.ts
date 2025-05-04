import axios from 'axios';

const backendPort = import.meta.env.VITE_EXPRESS_PORT;

const api = axios.create({
	baseURL: `http://localhost:${backendPort}/api`,
	withCredentials: true, // sends cookies with requests
	headers: {
		'Content-Type': 'application/json'
	}
});

export default api;

// old solution with fetch
// type Options = {
// 	method?: string;
// 	credentials?: RequestCredentials;
// 	headers?: object;
// 	body?: string;
// };

// //TODO: use this function to simplify fetch calls on pages (login done)
// export async function apiFetch(path: unknown, options: Options) {
// 	return fetch(`http://localhost:3000/api${path}`, {
// 		...options,
// 		credentials: 'include',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			...(options.headers || {})
// 		}
// 	});
// }
