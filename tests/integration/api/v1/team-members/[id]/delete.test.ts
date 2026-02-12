import FEATURES from "infra/features";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/team-members/[id]", () => {
	describe("Anonymous User", () => {
		test("Deleting team member without auth", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.DELETE_TEAM_MEMBER}'`,
				status_code: 403,
			};

			const teamMemberRecord = await orchestrator.createTeamMember();

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "DELETE",
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Logged User with no permission", () => {
		test("Deleting team member", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.DELETE_TEAM_MEMBER}'`,
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${session.token}`,
					},
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Logged User with permission (Manager)", () => {
		test("Deleting team member with valid ID", async () => {
			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			// Verifica que o membro está ativo antes
			expect(teamMemberRecord.active).toBe(true);

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${managerSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(teamMemberRecord.id);
			expect(responseBody.name).toBe(teamMemberRecord.name);
			expect(responseBody.active).toBe(false);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
			expect(responseBody.updated_at).not.toBe(responseBody.created_at);
		});

		test("Deleting already inactive team member", async () => {
			const errorResponse = {
				name: "ValidationError",
				message: "Este membro da equipe já está inativo.",
				action: "Verifique se o membro selecionado está ativo antes de desativá-lo.",
				status_code: 400,
			};

			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			// Primeira desativação
			await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${managerSession.token}`,
					},
				},
			);

			// Tenta desativar novamente
			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${managerSession.token}`,
					},
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});

		test("Deleting team member with non-existing ID", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Membro da equipe não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const nonExistingId = "00000000-0000-4000-8000-000000000000";

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${nonExistingId}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${managerSession.token}`,
					},
				},
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Logged User with permission (Admin)", () => {
		test("Deleting team member with valid ID", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			// Verifica que o membro está ativo antes
			expect(teamMemberRecord.active).toBe(true);

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(teamMemberRecord.id);
			expect(responseBody.name).toBe(teamMemberRecord.name);
			expect(responseBody.active).toBe(false);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
			expect(responseBody.updated_at).not.toBe(responseBody.created_at);
		});

		test("Deleting team member with non-existing ID", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Membro da equipe não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const nonExistingId = "00000000-0000-4000-8000-000000000000";

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${nonExistingId}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
});
