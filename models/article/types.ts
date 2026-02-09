export type ArticleRecord = {
	id: string;
	title: string;
	subtitle: string;
	thumbnail: string;
	text: string;
	view_count: number;
	active: boolean;
	created_by: string | null;
	updated_by: string | null;
	deleted_by: string | null;
	deleted_at: Date | null;
	created_at: Date;
	updated_at: Date;
};

export type CreateArticleInput = {
	title: string;
	subtitle: string;
	thumbnail: string;
	text: string;
	created_by?: string | null;
	updated_by?: string | null;
	active?: boolean;
	view_count?: number;
};

export type UpdateArticleInput = {
	title?: string;
	subtitle?: string;
	thumbnail?: string;
	text?: string;
	active?: boolean;
	updated_by?: string | null;
};
