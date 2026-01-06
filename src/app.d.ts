// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
type User = {
	id: number;
	username: string;
	email: string;
	role: string;
};

declare global {
	namespace App {
		interface Locals {
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		// interface Error {}
	}
}

export {};
