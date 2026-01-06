export type GroupType = 'TEACHER_STUDENT' | 'TEACHER_ONLY';

export type Group = {
	id: number;
	name: string;
};

export type mapGroupsToPosts = {
	groupId: number;
	postIds: number[];
};

export type GroupExtended = {
	id: number;
	name: string;
	description?: string;
	created_at: unknown;
	teachers_only: number;
};

export type User = {
	id: number;
	username: string;
	role: string;
};

export type GroupMapping = {
	groupId: number;
	groupName: string;
	description?: string;
	created_at: unknown;
	teachers_only: number;
	members: User[];
};
