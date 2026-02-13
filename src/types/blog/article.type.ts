export type ArticleLanguage = "portugues" | "ingles" | "frances";

export type Article = {
	id: string;
	title: string;
	subtitle: string | null;
	text: string;
	thumbnail: string | null;
	active: boolean;
	language: ArticleLanguage;
	created_at: string;
	updated_at: string;
};
