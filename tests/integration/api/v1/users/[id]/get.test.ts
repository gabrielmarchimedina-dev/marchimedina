import FEATURES from "infra/features";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[id]", () => {
	describe("Anonymous User", () => {
		test("Trying to read any user", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: "Verifique se o seu usuário possui a feature 'read:user'",
				status_code: 403,
			};

			const userId = "e43c38c6-468b-46e6-9f75-61414e51a2a4";

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${userId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();
			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Authenticated User", () => {
		test("Read another user with valid 'id'", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message:
					"Você não tem permissão para ler o perfil de outros usuários",
				action: `Verifique se seu usuário possui a feature '${FEATURES.LIST.READ_USER_OTHER}'`,
				status_code: 403,
			};
			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const userToRead = await orchestrator.createUser();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${userToRead.id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("Read self user with valid 'id'", async () => {
			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: user.id,
				name: user.name,
				email: user.email,
				features: responseBody.features,
				created_at: user.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(new Date(responseBody.created_at).toString()).not.toBeNaN();
			expect(new Date(responseBody.updated_at).toString()).not.toBeNaN();
		});
	});
	describe("Admin User", () => {
		test("With inexistent 'id'", async () => {
			const errorResponse = {
				message: "O id informado não foi encontrado no sistema.",
				name: "NotFoundError",
				action: "Verifique se o id informado está correto.",
				status_code: 404,
			};

			const inexistentUserId = "6e15d536-7d03-44de-bf1f-96b26c06f766";

			const adminUser = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(adminUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${inexistentUserId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("Read another user with valid 'id'", async () => {
			const adminUser = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(adminUser.id);

			const userToRead = await orchestrator.createUser();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${userToRead.id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: userToRead.id,
				name: userToRead.name,
				email: userToRead.email,
				features: responseBody.features,
				created_at: userToRead.created_at.toISOString(),
				updated_at: userToRead.updated_at.toISOString(),
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(new Date(responseBody.created_at).toString()).not.toBeNaN();
			expect(new Date(responseBody.updated_at).toString()).not.toBeNaN();
		});
		test("Read self user with valid 'id'", async () => {
			const adminUser = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(adminUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${adminUser.id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: adminUser.id,
				name: adminUser.name,
				email: adminUser.email,
				features: responseBody.features,
				created_at: adminUser.created_at.toISOString(),
				updated_at: adminUser.updated_at.toISOString(),
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(new Date(responseBody.created_at).toString()).not.toBeNaN();
			expect(new Date(responseBody.updated_at).toString()).not.toBeNaN();
		});
	});
});
