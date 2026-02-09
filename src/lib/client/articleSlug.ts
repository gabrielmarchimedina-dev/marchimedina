export function slugifyTitle(title: string) {
	return title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export function createArticleSlug(article: {
	id: string | number;
	title: string;
}) {
	return String(article.id);
}

export function getArticleIdFromSlug(slug?: string | null) {
	if (!slug) {
		return "";
	}

	return slug;
}
