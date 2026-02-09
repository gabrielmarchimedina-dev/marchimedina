import orchestrator from "tests/orchestrator";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/team-members/[id]", () => {
	describe("Anonymous User", () => {
		test("Should see team member", async () => {
			const teamMember = await orchestrator.createTeamMember();

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMember.id}`,
			);
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: teamMember.id,
				name: teamMember.name,
				email: teamMember.email,
				oab_number: teamMember.oab_number,
				education: teamMember.education,
				lattes_url: teamMember.lattes_url,
				bio: teamMember.bio,
				languages: teamMember.languages,
				image_url: teamMember.image_url,
				role: teamMember.role,
				instagram: teamMember.instagram,
				linkedin: teamMember.linkedin,
				active: teamMember.active,
				created_at: teamMember.created_at.toISOString(),
				updated_at: teamMember.updated_at.toISOString(),
			});
		});
		test("Should see 404 for non-existing team member", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Membro da equipe não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const nonExistingId = "86ef8905-7dd8-42a9-ab94-9d29f3316438";

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${nonExistingId}`,
			);
			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Authenticated User", () => {
		test("Should see team member", async () => {
			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);
			const teamMember = await orchestrator.createTeamMember();

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMember.id}`,
				{
					headers: {
						Cookie: `session_id=${session.token}`,
					},
				},
			);
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: teamMember.id,
				name: teamMember.name,
				email: teamMember.email,
				oab_number: teamMember.oab_number,
				education: teamMember.education,
				lattes_url: teamMember.lattes_url,
				bio: teamMember.bio,
				languages: teamMember.languages,
				image_url: teamMember.image_url,
				role: teamMember.role,
				instagram: teamMember.instagram,
				linkedin: teamMember.linkedin,
				active: teamMember.active,
				created_at: teamMember.created_at.toISOString(),
				updated_at: teamMember.updated_at.toISOString(),
			});
		});
		test("Should see 404 for non-existing team member", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Membro da equipe não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const nonExistingId = "86ef8905-7dd8-42a9-ab94-9d29f3316438";

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${nonExistingId}`,
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
		test("Should see team member", async () => {
			const user = await orchestrator.createManagerUser();
			const session = await orchestrator.createSession(user.id);
			const teamMember = await orchestrator.createTeamMember();

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMember.id}`,
				{
					headers: {
						Cookie: `session_id=${session.token}`,
					},
				},
			);
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: teamMember.id,
				name: teamMember.name,
				email: teamMember.email,
				oab_number: teamMember.oab_number,
				education: teamMember.education,
				lattes_url: teamMember.lattes_url,
				bio: teamMember.bio,
				languages: teamMember.languages,
				image_url: teamMember.image_url,
				role: teamMember.role,
				instagram: teamMember.instagram,
				linkedin: teamMember.linkedin,
				active: teamMember.active,
				created_at: teamMember.created_at.toISOString(),
				updated_at: teamMember.updated_at.toISOString(),
			});
		});
		test("Should see 404 for non-existing team member", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Membro da equipe não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const nonExistingId = "86ef8905-7dd8-42a9-ab94-9d29f3316438";

			const user = await orchestrator.createManagerUser();
			const session = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${nonExistingId}`,
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
