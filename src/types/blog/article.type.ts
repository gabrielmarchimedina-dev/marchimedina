export type Article = {
	id: string;
	title: string;
	subtitle: string | null;
	text: string;
	thumbnail: string | null;
	active: boolean;
	created_at: string;
	updated_at: string;
};
