import FEATURES from "infra/features";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[id]/update-features", () => {
	describe("Anonymous User Update Features", () => {
		test("No permission should fail", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.UPDATE_USER_FEATURES}'`,
				status_code: 403,
			};

			const response = await fetch(
				"http://localhost:3000/api/v1/users/dd3a93ae-cafc-4d0d-ba3e-c965b729d66d/update-features",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						features: [FEATURES.LIST.UPDATE_USER_SELF],
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Logged User Update Features", () => {
		test("No permission should fail", async () => {
			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.UPDATE_USER_FEATURES}'`,
				status_code: 403,
			};

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
					body: JSON.stringify({
						features: [FEATURES.LIST.UPDATE_USER_SELF],
					}),
				},
			);

			expect(response.status).toBe(403);
			const responseBody = await response.json();
			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Manager User Update Features", () => {
		test("Manager updating another user", async () => {
			const managerUser = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(
				managerUser.id,
			);

			const anotherUser = await orchestrator.createUser();
			await orchestrator.activateUser(anotherUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${anotherUser.id}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${managerSession.token}`,
					},
					body: JSON.stringify({
						features: [FEATURES.LIST.UPDATE_USER_OTHER],
					}),
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(anotherUser.id);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(responseBody.features).toEqual([
				FEATURES.LIST.UPDATE_USER_OTHER,
				...FEATURES.DEFAULT_USER_FEATURES,
			]);
		});

		test("Manager trying to edit another manager", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Não é possível editar permissões de um gerente.",
				action: "Somente administradores podem fazer isso.",
				status_code: 403,
			};

			const managerUser1 = await orchestrator.createManagerUser();
			const managerSession1 = await orchestrator.createSession(
				managerUser1.id,
			);

			const managerUser2 = await orchestrator.createManagerUser();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${managerUser2.id}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${managerSession1.token}`,
					},
					body: JSON.stringify({
						features: [...FEATURES.DEFAULT_USER_FEATURES],
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});

		test("Manager trying to edit admin should fail", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message:
					"Não é possível editar permissões de um administrador.",
				action: "Esta operação é bloqueada por segurança.",
				status_code: 403,
			};

			const managerUser = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(
				managerUser.id,
			);

			const adminUser = await orchestrator.createAdminUser();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${adminUser.id}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${managerSession.token}`,
					},
					body: JSON.stringify({
						features: [...FEATURES.DEFAULT_USER_FEATURES],
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Admin User Update Features", () => {
		test("Admin updating self", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não pode editar suas próprias permissões.",
				action: "Peça para outro administrador fazer isso.",
				status_code: 403,
			};

			const adminUser = await orchestrator.createAdminUser();
			const adminUserSession = await orchestrator.createSession(
				adminUser.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${adminUser.id}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminUserSession.token}`,
					},
					body: JSON.stringify({
						features: [...adminUser.features],
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("Update another user permission", async () => {
			const adminUser = await orchestrator.createAdminUser();
			const adminUserSession = await orchestrator.createSession(
				adminUser.id,
			);

			const anotherUser = await orchestrator.createUser();
			const activatedAnotherUser = await orchestrator.activateUser(
				anotherUser.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${anotherUser.id}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminUserSession.token}`,
					},
					body: JSON.stringify({
						features: [FEATURES.LIST.UPDATE_USER_OTHER],
					}),
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(anotherUser.id);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(responseBody.features).toEqual([
				FEATURES.LIST.UPDATE_USER_OTHER,
				...FEATURES.DEFAULT_USER_FEATURES,
			]);
		});
		test("Update another user permission with update feature (make manager)", async () => {
			const adminUser = await orchestrator.createAdminUser();
			const adminUserSession = await orchestrator.createSession(
				adminUser.id,
			);

			const anotherUser = await orchestrator.createUser();
			await orchestrator.activateUser(anotherUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${anotherUser.id}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminUserSession.token}`,
					},
					body: JSON.stringify({
						features: [FEATURES.LIST.UPDATE_USER_FEATURES],
					}),
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(anotherUser.id);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(responseBody.features).toEqual(
				FEATURES.MANAGER_USER_FEATURES,
			);
		});
		test("Admin trying to edit another admin", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message:
					"Não é possível editar permissões de um administrador.",
				action: "Esta operação é bloqueada por segurança.",
				status_code: 403,
			};

			const adminUser1 = await orchestrator.createAdminUser();
			const adminUser1Session = await orchestrator.createSession(
				adminUser1.id,
			);

			const adminUser2 = await orchestrator.createAdminUser();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${adminUser2.id}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminUser1Session.token}`,
					},
					body: JSON.stringify({
						features: [...adminUser2.features],
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
});
