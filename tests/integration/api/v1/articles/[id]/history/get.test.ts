import orchestrator from "tests/orchestrator";
import article from "models/article";
import articleHistory from "models/aticleHistory";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/articles/[id]/history", () => {
	describe("Anonymous User", () => {
		test("Should see article history", async () => {
			const articleRecord = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/old.png",
				text: "Article content",
			});

			await articleHistory.createMany([
				{
					article_id: articleRecord.id,
					field: "title",
					old_value: "Old title",
					new_value: "Article Title",
				},
				{
					article_id: articleRecord.id,
					field: "active",
					old_value: "false",
					new_value: "true",
				},
			]);

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}/history`,
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toBe(2);
			expect(responseBody[0].article_id).toBe(articleRecord.id);
			expect(responseBody[1].article_id).toBe(articleRecord.id);
		});
	});

	describe("Logged-in User", () => {
		test("Should see article history", async () => {
			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const articleRecord = await article.create({
				title: "Article Title",
				subtitle: "Article Subtitle",
				thumbnail: "assets/images/blog/old.png",
				text: "Article content",
			});

			await articleHistory.createMany([
				{
					article_id: articleRecord.id,
					field: "subtitle",
					old_value: "Old subtitle",
					new_value: "Article Subtitle",
					edited_by: user.id,
				},
			]);

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}/history`,
				{
					headers: {
						Cookie: `session_id=${session.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toBe(1);
			expect(responseBody[0].field).toBe("subtitle");
			expect(responseBody[0].edited_by).toBe(user.id);
			expect(responseBody[0].edited_by_name).toBe(user.name);
		});
	});
});
