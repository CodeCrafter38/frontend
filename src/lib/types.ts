export type User = {
	userId: number;
	username: string;
	role: string;
	profilePicture: FileType | null;
	canChangePassword?: boolean;
};

export type UserOfGroup = {
	id: number;
	username: string;
	role: string;
};

export type Post = {
	id: number;
	title: string;
	content: string;
	labels: string[];
	created_at: Date;
	user_id: number;
	username: string;
	teachers_only: number;
	files: FileType[] | null;
	video_link?: string;
	comments: Comment[];
};

export type Comment = {
	id: number;
	content: string;
	created_at: Date;
	post_id: number;
	user_id: number;
	username: string;
};

export type GroupType = 'TEACHER_STUDENT' | 'TEACHER_ONLY';

export type Group = {
	id: number;
	name: string;
};

export type GroupExtended = {
	id: number;
	name: string;
	description?: string;
	created_at: Date;
	teachers_only: number;
};

export type mapGroupsToPosts = {
	groupId: number;
	postIds: number[];
};

export type GroupMapping = {
	groupId: number;
	groupName: string;
	description?: string;
	created_at: Date;
	teachers_only: number;
	members: UserOfGroup[];
};

export type FileType = {
	path: string;
	size: number;
	filename: string;
	mimetype: string;
};
