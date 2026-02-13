import FEATURES from "infra/features";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import fs from "fs";
import path from "path";
import article from "models/article";
import articleHistory from "models/aticleHistory";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

afterAll(async () => {
	const testImagesPath = path.join(
		process.cwd(),
		"public/assets/images/blog",
	);
	try {
		const files = await fs.promises.readdir(testImagesPath);
		for (const file of files) {
			if (file.endsWith(".png")) {
				await fs.promises.unlink(path.join(testImagesPath, file));
			}
		}
	} catch (error) {
		// Ignora erro se pasta não existir
	}
});

async function createTestImageFile(filename: string): Promise<File> {
	const buffer = Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
		"base64",
	);
	const blob = new Blob([buffer], { type: "image/png" });
	return new File([blob], filename, { type: "image/png" });
}

describe("PATCH /api/v1/articles/[id]", () => {
	describe("Anonymous User", () => {
		test("Updating article without auth", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.UPDATE_ARTICLE}'`,
				status_code: 403,
			};

			const articleRecord = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/old.png",
				text: "Article content",
			});

			const formData = new FormData();
			formData.append("title", "Updated Title");

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "PATCH",
					body: formData,
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Logged User with no permission", () => {
		test("Updating article", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.UPDATE_ARTICLE}'`,
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const articleRecord = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/old.png",
				text: "Article content",
			});

			const formData = new FormData();
			formData.append("title", "Updated Title");

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${session.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Logged User with permission (Admin)", () => {
		test("Updating article with valid data (title only)", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const articleRecord = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/old.png",
				text: "Article content",
			});

			const formData = new FormData();
			formData.append("title", "Updated Title");

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(articleRecord.id);
			expect(responseBody.title).toBe("Updated Title");
			expect(responseBody.subtitle).toBe(articleRecord.subtitle);
			expect(responseBody.thumbnail).toBe(articleRecord.thumbnail);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
			expect(responseBody.updated_at).not.toBe(responseBody.created_at);

			const historyEntries = await articleHistory.findAllByArticleId(
				articleRecord.id,
			);
			expect(historyEntries.length).toBe(1);
			expect(historyEntries[0].field).toBe("title");
			expect(historyEntries[0].old_value).toBe(articleRecord.title);
			expect(historyEntries[0].new_value).toBe("Updated Title");
			expect(historyEntries[0].edited_by).toBe(admin.id);
		});

		test("Updating article with multiple fields", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const articleRecord = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/old.png",
				text: "Article content",
			});

			const formData = new FormData();
			formData.append("title", "New Title");
			formData.append("subtitle", "New Subtitle");
			formData.append("text", "Updated content");
			formData.append("active", "false");

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(articleRecord.id);
			expect(responseBody.title).toBe("New Title");
			expect(responseBody.subtitle).toBe("New Subtitle");
			expect(responseBody.text).toBe("Updated content");
			expect(responseBody.active).toBe(false);
		});

		test("Updating article with new thumbnail", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const articleRecord = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/old.png",
				text: "Article content",
			});

			const testFile = await createTestImageFile("new-thumbnail.png");

			const formData = new FormData();
			formData.append("file", testFile);

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(articleRecord.id);
			expect(responseBody.thumbnail).not.toBe(articleRecord.thumbnail);
			expect(responseBody.thumbnail).toMatch(
				/^assets\/images\/blog\/\d+\.png$/,
			);
		});

		test("Updating article with non-existing id", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Artigo não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const nonExistingId = "86ef8905-7dd8-42a9-ab94-9d29f3316438";

			const formData = new FormData();
			formData.append("title", "Updated Title");

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${nonExistingId}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});

		test("Updating article with authors and language", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const author = await orchestrator.createTeamMember();

			const articleRecord = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/old.png",
				text: "Article content",
			});

			const formData = new FormData();
			formData.append("language", "frances");
			formData.append("authors", JSON.stringify([author.id]));

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(articleRecord.id);
			expect(responseBody.language).toBe("frances");
			expect(responseBody.authors).toEqual([author.id]);

			const historyEntries = await articleHistory.findAllByArticleId(
				articleRecord.id,
			);
			const languageHistory = historyEntries.find(
				(e) => e.field === "language",
			);
			const authorsHistory = historyEntries.find(
				(e) => e.field === "authors",
			);

			expect(languageHistory).toBeDefined();
			expect(languageHistory?.old_value).toBe("portugues");
			expect(languageHistory?.new_value).toBe("frances");

			expect(authorsHistory).toBeDefined();
			expect(authorsHistory?.old_value).toBeNull();
			expect(authorsHistory?.new_value).toBe(JSON.stringify([author.id]));
		});
	});
});
