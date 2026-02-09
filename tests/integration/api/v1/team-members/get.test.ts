import orchestrator from "tests/orchestrator";

const createdUsersQuantity = 10;

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();

	for (let i = 1; i <= createdUsersQuantity; i++) {
		await orchestrator.createTeamMember();
	}
});

describe("GET /api/v1/team-members", () => {
	describe("Anonymous User", () => {
		test("Should see all team members", async () => {
			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toEqual(createdUsersQuantity);
		});
	});
	describe("Logged-in User", () => {
		test("Should see all team members", async () => {
			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					headers: {
						Cookie: `session_id=${userSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toEqual(createdUsersQuantity);
		});
	});
	describe("Admin User", () => {
		test("Should see all team members", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toEqual(createdUsersQuantity);
		});
		test("Should return empty", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
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
