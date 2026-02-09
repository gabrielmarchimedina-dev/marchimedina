export type ArticleHistoryRecord = {
	id: string;
	article_id: string;
	field: string;
	old_value: string | null;
	new_value: string | null;
	edited_by: string | null;
	edited_by_name?: string | null;
	deleted_at: Date | null;
	created_at: Date;
	updated_at: Date;
};

export type CreateArticleHistoryInput = {
	article_id: string;
	field: string;
	old_value: string | null;
	new_value: string | null;
	edited_by?: string | null;
};
