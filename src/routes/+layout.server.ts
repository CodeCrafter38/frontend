import axios from 'axios';

export async function load({ request }) {
	try {
		const res = await axios.get('http://localhost:4000/api/me', {
			headers: {
				// pass cookies from SSR (server-side-rendering)
				cookie: request.headers.get('cookie')
			},
			withCredentials: true
		});
		return { user: res.data };
	} catch {
		return { user: null };
	}
}
