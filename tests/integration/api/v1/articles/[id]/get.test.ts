import orchestrator from "tests/orchestrator";
import article from "models/article";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/articles/[id]", () => {
	describe("Anonymous User", () => {
		test("Should see article", async () => {
			const createdArticle = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/1.png",
				text: "Article content",
			});

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${createdArticle.id}`,
			);
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdArticle.id,
				title: createdArticle.title,
				subtitle: createdArticle.subtitle,
				thumbnail: createdArticle.thumbnail,
				text: createdArticle.text,
				view_count: createdArticle.view_count,
				active: createdArticle.active,
				created_by: createdArticle.created_by,
				updated_by: createdArticle.updated_by,
				deleted_by: createdArticle.deleted_by,
				deleted_at: createdArticle.deleted_at,
				created_at: createdArticle.created_at.toISOString(),
				updated_at: createdArticle.updated_at.toISOString(),
			});
		});

		test("Should see 404 for non-existing article", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Artigo não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const nonExistingId = "86ef8905-7dd8-42a9-ab94-9d29f3316438";

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${nonExistingId}`,
			);
			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Authenticated User", () => {
		test("Should see article", async () => {
			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const createdArticle = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/1.png",
				text: "Article content",
			});

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${createdArticle.id}`,
				{
					headers: {
						Cookie: `session_id=${session.token}`,
					},
				},
			);
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdArticle.id,
				title: createdArticle.title,
				subtitle: createdArticle.subtitle,
				thumbnail: createdArticle.thumbnail,
				text: createdArticle.text,
				view_count: createdArticle.view_count,
				active: createdArticle.active,
				created_by: createdArticle.created_by,
				updated_by: createdArticle.updated_by,
				deleted_by: createdArticle.deleted_by,
				deleted_at: createdArticle.deleted_at,
				created_at: createdArticle.created_at.toISOString(),
				updated_at: createdArticle.updated_at.toISOString(),
			});
		});

		test("Should see 404 for non-existing article", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Artigo não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const nonExistingId = "86ef8905-7dd8-42a9-ab94-9d29f3316438";

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${nonExistingId}`,
				{
					headers: {
						Cookie: `session_id=${session.token}`,
					},
				},
			);
			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Manager Authenticated User", () => {
		test("Should see article", async () => {
			const user = await orchestrator.createManagerUser();
			const session = await orchestrator.createSession(user.id);

			const createdArticle = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/1.png",
				text: "Article content",
			});

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${createdArticle.id}`,
				{
					headers: {
						Cookie: `session_id=${session.token}`,
					},
				},
			);
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdArticle.id,
				title: createdArticle.title,
				subtitle: createdArticle.subtitle,
				thumbnail: createdArticle.thumbnail,
				text: createdArticle.text,
				view_count: createdArticle.view_count,
				active: createdArticle.active,
				created_by: createdArticle.created_by,
				updated_by: createdArticle.updated_by,
				deleted_by: createdArticle.deleted_by,
				deleted_at: createdArticle.deleted_at,
				created_at: createdArticle.created_at.toISOString(),
				updated_at: createdArticle.updated_at.toISOString(),
			});
		});

		test("Should see 404 for non-existing article", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Artigo não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const nonExistingId = "86ef8905-7dd8-42a9-ab94-9d29f3316438";

			const user = await orchestrator.createManagerUser();
			const session = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${nonExistingId}`,
				{
					headers: {
						Cookie: `session_id=${session.token}`,
					},
				},
			);
			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
});
