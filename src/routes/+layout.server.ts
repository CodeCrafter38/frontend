// export const load = async ({ fetch }): Promise<{ user: { username: string } | null }> => {
// 	try {
// 		const res = await fetch('http://localhost:4000/api/me', {
// 			credentials: 'include' // include cookies
// 		});

// 		if (res.ok) {
// 			//console.log('res.json in layout server ts: ', res.json());
// 			const user = await res.json();
// 			console.log('user in layout server ts: ', user);
// 			return { user };
// 		}

// 		return { user: null };
// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	} catch (e: any) {
// 		return { user: null };
// 	}
// };
