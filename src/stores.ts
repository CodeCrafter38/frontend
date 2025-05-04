// import { get, writable } from 'svelte/store';

// export function storable(data: unknown) {
// 	const store = writable(data);
// 	const { subscribe, set, update } = store;
// 	const isBrowser = typeof window !== 'undefined';

// 	if (isBrowser && localStorage.storable) {
// 		set(JSON.parse(localStorage.storable));
// 	}

// 	return {
// 		subscribe,
// 		set: (n: unknown) => {
// 			if (isBrowser) {
// 				localStorage.storable = JSON.stringify(n);
// 			}
// 			set(n);
// 		},
// 		update: (cb: unknown) => {
// 			const updatedStore = cb(get(store));

// 			if (isBrowser) {
// 				localStorage.storable = JSON.stringify(updatedStore);
// 			}
// 			update(updatedStore);
// 		}
// 	};
// }
