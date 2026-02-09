export type UploadResult = {
	filename: string;
	path: string;
	url: string;
};

export type UploadOptions = {
	entityType: "team_member" | "blog_post";
	maxSizeInMB?: number;
	allowedTypes?: string[];
};
