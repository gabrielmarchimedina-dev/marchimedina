import orchestrator from "tests/orchestrator";
import article from "models/article";

const createdArticlesQuantity = 10;

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();

	for (let i = 1; i <= createdArticlesQuantity; i++) {
		await article.create({
			title: `Article ${i}`,
			subtitle: `Subtitle ${i}`,
			thumbnail: `assets/images/blog/${i}.png`,
			text: `Content ${i}`,
		});
	}
});

describe("GET /api/v1/articles", () => {
	describe("Anonymous User", () => {
		test("Should see all articles", async () => {
			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toEqual(createdArticlesQuantity);
		});
	});

	describe("Logged-in User", () => {
		test("Should see all articles", async () => {
			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
				{
					headers: {
						Cookie: `session_id=${userSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toEqual(createdArticlesQuantity);
		});
	});

	describe("Admin User", () => {
		test("Should see all articles", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
				{
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toEqual(createdArticlesQuantity);
		});

		test("Should return empty", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
				{
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toEqual(0);
		});
	});
});
