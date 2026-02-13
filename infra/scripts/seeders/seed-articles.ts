import { faker } from "@faker-js/faker";
import article from "models/article";
import { CreateArticleInput } from "models/article/types";
require("dotenv").config({ path: ".env.development" });

faker.seed(20260203);

const THUMBNAILS = [
	"client/assets/images/mockBlog/thumb-post-1.jpg",
	"client/assets/images/mockBlog/thumb-post-2.jpg",
	"client/assets/images/mockBlog/thumb-post-3.jpg",
	"client/assets/images/mockBlog/thumb-post-4.jpg",
	"client/assets/images/mockBlog/thumb-post-5.jpg",
	"client/assets/images/mockBlog/thumb-post-6.jpg",
];

const LANGUAGES: Array<"portugues" | "ingles" | "frances"> = [
	"portugues",
	"ingles",
	"frances",
];

function buildArticle(
	index: number,
	language: "portugues" | "ingles" | "frances",
): CreateArticleInput {
	const title = faker.lorem.sentence({ min: 3, max: 6 }).replace(/\.$/, "");
	const subtitle = faker.lorem
		.sentence({ min: 6, max: 10 })
		.replace(/\.$/, "");
	const text = faker.lorem.paragraphs({ min: 3, max: 6 });
	const thumbnail = THUMBNAILS[(index - 1) % THUMBNAILS.length];

	return {
		title,
		subtitle,
		thumbnail,
		text,
		view_count: faker.number.int({ min: 0, max: 120 }),
		active: true,
		language,
	};
}

async function seedArticles() {
	try {
		const createdArticles: CreateArticleInput[] = [];

		for (const language of LANGUAGES) {
			for (let i = 1; i <= 7; i += 1) {
				const newArticle = buildArticle(
					createdArticles.length + 1,
					language,
				);
				await article.create(newArticle);
				createdArticles.push(newArticle);
			}
		}

		console.log(`✅ ${createdArticles.length} artigos criados.`);
		process.exit(0);
	} catch (error) {
		console.error("❌ Erro ao criar artigos:", error);
		process.exit(1);
	}
}

seedArticles();
