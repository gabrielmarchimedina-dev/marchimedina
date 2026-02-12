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

	describe("Inactive Articles Visibility", () => {
		test("User WITHOUT read:inactive:article should NOT see inactive articles", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();

			// Cria 2 artigos ativos e 1 inativo
			await article.create({
				title: "Active Article 1",
				subtitle: "Subtitle",
				thumbnail: "assets/images/blog/1.png",
				text: "Content",
				active: true,
			});
			await article.create({
				title: "Active Article 2",
				subtitle: "Subtitle",
				thumbnail: "assets/images/blog/2.png",
				text: "Content",
				active: true,
			});
			await article.create({
				title: "Inactive Article",
				subtitle: "Subtitle",
				thumbnail: "assets/images/blog/3.png",
				text: "Content",
				active: false,
			});

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

			expect(responseBody.length).toBe(2);
			expect(
				responseBody.every((article: any) => article.active === true),
			).toBe(true);
		});

		test("Manager WITH read:inactive:article should see inactive articles", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();

			// Cria 2 artigos ativos e 1 inativo
			await article.create({
				title: "Active Article 1",
				subtitle: "Subtitle",
				thumbnail: "assets/images/blog/1.png",
				text: "Content",
				active: true,
			});
			await article.create({
				title: "Active Article 2",
				subtitle: "Subtitle",
				thumbnail: "assets/images/blog/2.png",
				text: "Content",
				active: true,
			});
			await article.create({
				title: "Inactive Article",
				subtitle: "Subtitle",
				thumbnail: "assets/images/blog/3.png",
				text: "Content",
				active: false,
			});

			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
				{
					headers: {
						Cookie: `session_id=${managerSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toBe(3);
			expect(
				responseBody.some((article: any) => article.active === false),
			).toBe(true);
		});

		test("Anonymous user should NOT see inactive articles", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();

			await article.create({
				title: "Active Article",
				subtitle: "Subtitle",
				thumbnail: "assets/images/blog/1.png",
				text: "Content",
				active: true,
			});
			await article.create({
				title: "Inactive Article",
				subtitle: "Subtitle",
				thumbnail: "assets/images/blog/2.png",
				text: "Content",
				active: false,
			});

			const response = await fetch(
				"http://localhost:3000/api/v1/articles",
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toBe(1);
			expect(responseBody[0].active).toBe(true);
		});
	});
});
