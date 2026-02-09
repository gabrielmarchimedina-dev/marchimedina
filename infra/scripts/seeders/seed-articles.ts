import { faker } from "@faker-js/faker";
import article from "models/article";
import user from "models/user";
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

async function resolveAdminUserId(): Promise<string | null> {
	try {
		const adminUser = await user.findOneByEmail("admin@mm.com");
		return adminUser?.id ?? null;
	} catch (error: any) {
		if (error.statusCode !== 404) {
			throw error;
		}
		return null;
	}
}

function buildArticle(
	index: number,
	createdBy: string | null,
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
		created_by: createdBy,
		updated_by: createdBy,
	};
}

async function seedArticles() {
	try {
		const createdBy = await resolveAdminUserId();
		const createdArticles: CreateArticleInput[] = [];

		for (let i = 1; i <= 6; i += 1) {
			const newArticle = buildArticle(i, createdBy);
			await article.create(newArticle);
			createdArticles.push(newArticle);
		}

		console.log(`✅ ${createdArticles.length} artigos criados.`);
		process.exit(0);
	} catch (error) {
		console.error("❌ Erro ao criar artigos:", error);
		process.exit(1);
	}
}

seedArticles();
