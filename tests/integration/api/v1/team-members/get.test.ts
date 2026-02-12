import orchestrator from "tests/orchestrator";
import teamMember from "models/teamMember";

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

	describe("Inactive Team Members Visibility", () => {
		test("User WITHOUT read:inactive:team_member should NOT see inactive members", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();

			// Cria 2 membros ativos e 1 inativo
			await teamMember.create({
				name: "Active Member 1",
				role: "Developer",
				bio: "Bio",
				image_url: "assets/images/teamMembers/1.png",
				active: true,
			});
			await teamMember.create({
				name: "Active Member 2",
				role: "Designer",
				bio: "Bio",
				image_url: "assets/images/teamMembers/2.png",
				active: true,
			});
			await teamMember.create({
				name: "Inactive Member",
				role: "Manager",
				bio: "Bio",
				image_url: "assets/images/teamMembers/3.png",
				active: false,
			});

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

			expect(responseBody.length).toBe(2);
			expect(
				responseBody.every((member: any) => member.active === true),
			).toBe(true);
		});

		test("Manager WITH read:inactive:team_member should see inactive members", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();

			// Cria 2 membros ativos e 1 inativo
			await teamMember.create({
				name: "Active Member 1",
				role: "Developer",
				bio: "Bio",
				image_url: "assets/images/teamMembers/1.png",
				active: true,
			});
			await teamMember.create({
				name: "Active Member 2",
				role: "Designer",
				bio: "Bio",
				image_url: "assets/images/teamMembers/2.png",
				active: true,
			});
			await teamMember.create({
				name: "Inactive Member",
				role: "Manager",
				bio: "Bio",
				image_url: "assets/images/teamMembers/3.png",
				active: false,
			});

			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
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
				responseBody.some((member: any) => member.active === false),
			).toBe(true);
		});

		test("Anonymous user should NOT see inactive team members", async () => {
			await orchestrator.clearDatabase();
			await orchestrator.runPendingMigrations();

			await teamMember.create({
				name: "Active Member",
				role: "Developer",
				bio: "Bio",
				image_url: "assets/images/teamMembers/1.png",
				active: true,
			});
			await teamMember.create({
				name: "Inactive Member",
				role: "Designer",
				bio: "Bio",
				image_url: "assets/images/teamMembers/2.png",
				active: false,
			});

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.length).toBe(1);
			expect(responseBody[0].active).toBe(true);
		});
	});
});
