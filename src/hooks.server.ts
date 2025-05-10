import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// egy google Chrome devTools probléma miatt van szükség erre a kódra
	// a frontend konzolján folyamatosan kiír egy hibát, ami nem befolyásolja a program működését, de zavaró
	// több infó: https://github.com/sveltejs/kit/issues/13743
	if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
		return new Response(null, { status: 204 }); // Üres válasz visszaadása 204 no-content státusszal
	}

	return await resolve(event);
};
