import orchestrator from "tests/orchestrator";

const createdUsersQuantity = 10;

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/team-members", () => {
	describe("Anonymous User", () => {
		test("Should see none", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: "Verifique se o seu usuário possui a feature 'read:user:other'",
				status_code: 403,
			};

			const response = await fetch("http://localhost:3000/api/v1/users");

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Logged-in User", () => {
		test("Should see none", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: "Verifique se o seu usuário possui a feature 'read:user:other'",
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch("http://localhost:3000/api/v1/users", {
				headers: {
					Cookie: `session_id=${userSession.token}`,
				},
			});

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Admin User", () => {
		test("Should see all users", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();
			for (let i = 1; i <= createdUsersQuantity; i++) {
				await orchestrator.createUser();
			}

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const response = await fetch("http://localhost:3000/api/v1/users", {
				headers: {
					Cookie: `session_id=${adminSession.token}`,
				},
			});

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toEqual(createdUsersQuantity + 1);
		});
	});
});
