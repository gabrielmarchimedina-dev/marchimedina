import { MetadataRoute } from "next";
import article from "models/article";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://marchimedina.com";
	const locales = ["pt", "en"];

	// Static pages for each locale
	const staticPages = locales.flatMap((locale) => [
		{
			url: `${baseUrl}/${locale}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 1,
		},
		{
			url: `${baseUrl}/${locale}/equipe`,
			lastModified: new Date(),
			changeFrequency: "monthly" as const,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/${locale}/blog`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/${locale}/contato`,
			lastModified: new Date(),
			changeFrequency: "monthly" as const,
			priority: 0.7,
		},
	]);

	// Dynamic article pages
	let articlePages: MetadataRoute.Sitemap = [];
	try {
		const articles = await article.findAll();
		const activeArticles = articles.filter((a) => a.active);

		articlePages = locales.flatMap((locale) =>
			activeArticles.map((a) => ({
				url: `${baseUrl}/${locale}/blog/${a.id}-${a.title
					.toLowerCase()
					.replace(/\s+/g, "-")
					.replace(/[^a-z0-9-]/g, "")}`,
				lastModified: new Date(a.updated_at),
				changeFrequency: "weekly" as const,
				priority: 0.6,
			})),
		);
	} catch (error) {
		console.error("Error fetching articles for sitemap:", error);
	}

	return [...staticPages, ...articlePages];
}
