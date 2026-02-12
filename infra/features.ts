// Todas as features disponíveis no sistema
const LIST = {
	// Sessions
	CREATE_SESSION: "create:session",
	READ_SESSION: "read:session",
	DELETE_SESSION: "delete:session",

	// Admin - protection to not be updated
	ADMIN: "is:admin",

	// Users
	READ_USER: "read:user",
	READ_USER_SELF: "read:user:self",
	READ_USER_OTHER: "read:user:other",
	CREATE_USER: "create:user",
	UPDATE_USER: "update:user",
	UPDATE_USER_OTHER: "update:user:other",
	UPDATE_USER_SELF: "update:user:self",
	UPDATE_USER_PASSWORD: "update:user:password",
	UPDATE_USER_FEATURES: "update:user:features",

	// Team Members
	READ_TEAM_MEMBER: "read:team_member",
	READ_INACTIVE_TEAM_MEMBER: "read:inactive:team_member",
	CREATE_TEAM_MEMBER: "create:team_member",
	UPDATE_TEAM_MEMBER: "update:team_member",
	DELETE_TEAM_MEMBER: "delete:team_member",

	// Articles
	READ_ARTICLE: "read:article",
	READ_INACTIVE_ARTICLE: "read:inactive:article",
	CREATE_ARTICLE: "create:article",
	UPDATE_ARTICLE: "update:article",
	DELETE_ARTICLE: "delete:article",

	// Activation
	READ_ACTIVATION_TOKEN: "read:activation_token",
} as const;

const ANONYMOUS_FEATURES = [
	LIST.READ_ACTIVATION_TOKEN,
	LIST.CREATE_SESSION,
	LIST.READ_TEAM_MEMBER,
	LIST.READ_ARTICLE,
];

const DEFAULT_USER_FEATURES = [
	LIST.CREATE_SESSION,
	LIST.DELETE_SESSION,
	LIST.READ_SESSION,
	LIST.READ_USER,
	LIST.READ_USER_SELF,
	LIST.UPDATE_USER,
	LIST.UPDATE_USER_SELF,
	LIST.UPDATE_USER_PASSWORD,
	LIST.READ_TEAM_MEMBER,
	LIST.READ_ARTICLE,
];

const MANAGER_USER_FEATURES = [
	...DEFAULT_USER_FEATURES,
	LIST.READ_USER_OTHER,
	LIST.CREATE_USER,
	LIST.UPDATE_USER_OTHER,
	LIST.READ_INACTIVE_TEAM_MEMBER,
	LIST.CREATE_TEAM_MEMBER,
	LIST.UPDATE_TEAM_MEMBER,
	LIST.DELETE_TEAM_MEMBER,
	LIST.READ_INACTIVE_ARTICLE,
	LIST.CREATE_ARTICLE,
	LIST.UPDATE_ARTICLE,
	LIST.DELETE_ARTICLE,
	LIST.UPDATE_USER_FEATURES,
];

const ADMIN_USER_FEATURES = [...MANAGER_USER_FEATURES, LIST.ADMIN];

const FEATURES = {
	LIST,
	ANONYMOUS_FEATURES,
	DEFAULT_USER_FEATURES,
	MANAGER_USER_FEATURES,
	ADMIN_USER_FEATURES,
};

export default FEATURES;
