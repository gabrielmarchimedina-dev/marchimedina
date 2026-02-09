export type CreateUserInput = {
	name: string;
	email: string;
	password?: string;
	features?: string[];
};

export type CreateTestUserInput = {
	name?: string;
	email?: string;
	password?: string;
};

export type UpdateUserInput = {
	name?: string;
	email?: string;
};

export type UserRecord = {
	id: string;
	name: string;
	email: string;
	password: string;
	features: string[];
	created_at: Date;
	updated_at: Date;
};

export type PublicUserRecord = {
	id: string;
	name: string;
	email: string;
	features: string[];
	created_at: Date;
	updated_at: Date;
};

export type UserFirstPasswords = {
	password: string;
	confirmPassword: string;
};

export type UserUpdatePassword = {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
};
