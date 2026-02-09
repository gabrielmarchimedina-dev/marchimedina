import orchestrator from "tests/orchestrator";
import fs from "fs";
import path from "path";

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

describe("POST /api/v1/articles", () => {
	describe("Anonymous User", () => {
		test("With unique and valid data", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: "Verifique se o seu usuário possui a feature 'create:article'",
				status_code: 403,
			};

			const testFile = await createTestImageFile("article.png");

			const formData = new FormData();
			formData.append("title", "Article Title");
			formData.append("subtitle", "Article Subtitle");
			formData.append("text", "Article content");
			formData.append("file", testFile);

			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
				{
					method: "POST",
					body: formData,
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Logged User with no permission", () => {
		test("With unique and valid data", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: "Verifique se o seu usuário possui a feature 'create:article'",
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const testFile = await createTestImageFile("article.png");

			const formData = new FormData();
			formData.append("title", "Article Title");
			formData.append("subtitle", "Article Subtitle");
			formData.append("text", "Article content");
			formData.append("file", testFile);

			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
				{
					method: "POST",
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

	describe("Admin User", () => {
		test("With unique and valid data", async () => {
			const adminUser = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(adminUser.id);

			const testFile = await createTestImageFile("article-admin.png");

			const formData = new FormData();
			formData.append("title", "Article Title");
			formData.append("subtitle", "Article Subtitle");
			formData.append("text", "Article content");
			formData.append("file", testFile);

			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(201);

			const responseBody = await response.json();

			expect(responseBody.id).toBeDefined();
			expect(responseBody.title).toBe("Article Title");
			expect(responseBody.subtitle).toBe("Article Subtitle");
			expect(responseBody.text).toBe("Article content");
			expect(responseBody.thumbnail).toMatch(
				/^assets\/images\/blog\/\d+\.png$/,
			);
			expect(responseBody.view_count).toBe(0);
			expect(responseBody.active).toBe(true);
			expect(responseBody.created_by).toBe(adminUser.id);
			expect(responseBody.updated_by).toBe(adminUser.id);
			expect(responseBody.deleted_by).toBeNull();
			expect(responseBody.deleted_at).toBeNull();
			expect(responseBody.created_at).toBeDefined();
			expect(responseBody.updated_at).toBeDefined();
		});
	});
});
