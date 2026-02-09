import FEATURES from "infra/features";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[id]", () => {
	describe("Anonymous User", () => {
		test("Updating self", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.UPDATE_USER}'`,
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json", // Without Cookie so it's an anonymous user requesting
					},
					body: JSON.stringify({
						email: "newEmail@gmail.com",
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("Updating another user", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.UPDATE_USER}'`,
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);

			const anotherUser = await orchestrator.createUser();
			await orchestrator.activateUser(anotherUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${anotherUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json", // Without Cookie so it's an anonymous user requesting
					},
					body: JSON.stringify({
						email: "newEmail@gmail.com",
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Authenticated User", () => {
		test("Update another with another user 'id'", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não pode atualizar o perfil de outros usuários",
				action: "Entre em contato com o suporte",
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const anotherUser = await orchestrator.createUser();
			await orchestrator.activateUser(anotherUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${anotherUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
					body: JSON.stringify({
						email: user.email,
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With empty body for self", async () => {
			const user = await orchestrator.createUser();
			const activatedUser = await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: activatedUser.id,
				name: activatedUser.name,
				email: activatedUser.email,
				features: activatedUser.features,
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at,
			});
		});
		test("With existing 'email' for self", async () => {
			const errorResponse = {
				name: "ValidationError",
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				action: "Utilize outro endereço de e-mail para realizar a atualização.",
				status_code: 400,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const anotherUser = await orchestrator.createUser();
			await orchestrator.activateUser(anotherUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
					body: JSON.stringify({
						email: anotherUser.email,
					}),
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With new 'name' for self", async () => {
			const existingUser = await orchestrator.createUser();
			const activatedUser = await orchestrator.activateUser(
				existingUser.id,
			);
			const existingUserSession = await orchestrator.createSession(
				activatedUser.id,
			);
			const newName = "New Name";

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${existingUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${existingUserSession.token}`,
					},
					body: JSON.stringify({
						name: newName,
					}),
				},
			);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: existingUser.id,
				name: newName,
				email: existingUser.email,
				features: activatedUser.features,
				created_at: existingUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(new Date(responseBody.updated_at).getTime()).toBeGreaterThan(
				existingUser.updated_at.getTime(),
			);
		});
		test("With new unique 'email' for self", async () => {
			const existingUser = await orchestrator.createUser();
			const activatedUser = await orchestrator.activateUser(
				existingUser.id,
			);
			const existingUserSession = await orchestrator.createSession(
				activatedUser.id,
			);
			const newEmail = "updated.email@gmail.com";

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${existingUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${existingUserSession.token}`,
					},
					body: JSON.stringify({
						email: newEmail,
					}),
				},
			);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: existingUser.id,
				name: existingUser.name,
				email: newEmail,
				features: activatedUser.features,
				created_at: existingUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(new Date(responseBody.updated_at).getTime()).toBeGreaterThan(
				existingUser.updated_at.getTime(),
			);
		});
	});
	describe("Authenticated Admin User", () => {
		test("With inexistent 'id' for another user", async () => {
			const errorResponse = {
				message: "O id informado não foi encontrado no sistema.",
				name: "NotFoundError",
				action: "Verifique se o id informado está correto.",
				status_code: 404,
			};

			const createdAdminUser = await orchestrator.createAdminUser();

			const session = await orchestrator.createSession(
				createdAdminUser.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/78bf1fab-12fe-4146-823f-c0c7bb817045`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${session.token}`,
					},
				},
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With empty body for another user", async () => {
			const createdAdminUser = await orchestrator.createAdminUser();

			const session = await orchestrator.createSession(
				createdAdminUser.id,
			);

			const existingUser = await orchestrator.createUser();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${existingUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${session.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: existingUser.id,
				name: existingUser.name,
				email: existingUser.email,
				features: existingUser.features,
				created_at: existingUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});
		});
		test("With duplicated 'email' for another user", async () => {
			const errorResponse = {
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro endereço de e-mail para realizar a atualização.",
				status_code: 400,
			};

			const createdAdminUser = await orchestrator.createAdminUser();
			const createdAdminSession = await orchestrator.createSession(
				createdAdminUser.id,
			);

			const createdUser = await orchestrator.createUser();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${createdAdminSession.token}`,
					},
					body: JSON.stringify({
						email: createdAdminUser.email,
					}),
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With new 'name' for another user", async () => {
			const createdAdminUser = await orchestrator.createAdminUser();
			const createdAdminSession = await orchestrator.createSession(
				createdAdminUser.id,
			);

			const existingUser = await orchestrator.createUser();

			const newName = "Updated Name";

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${existingUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${createdAdminSession.token}`,
					},
					body: JSON.stringify({
						name: newName,
					}),
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: existingUser.id,
				name: newName,
				email: existingUser.email,
				features: existingUser.features,
				created_at: existingUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(new Date(responseBody.updated_at).getTime()).toBeGreaterThan(
				existingUser.updated_at.getTime(),
			);
		});
		test("With new unique 'email' for another user", async () => {
			const createdAdminUser = await orchestrator.createAdminUser();
			const createdAdminSession = await orchestrator.createSession(
				createdAdminUser.id,
			);

			const existingUser = await orchestrator.createUser();

			const newEmail = "uniqueUpdated.email@gmail.com";

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${existingUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${createdAdminSession.token}`,
					},
					body: JSON.stringify({
						email: newEmail,
					}),
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: existingUser.id,
				name: existingUser.name,
				email: newEmail,
				features: existingUser.features,
				created_at: existingUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(new Date(responseBody.updated_at).getTime()).toBeGreaterThan(
				existingUser.updated_at.getTime(),
			);
		});
		test("With empty body for self", async () => {
			const createdAdminUser = await orchestrator.createAdminUser();

			const session = await orchestrator.createSession(
				createdAdminUser.id,
			);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdAdminUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${session.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdAdminUser.id,
				name: createdAdminUser.name,
				email: createdAdminUser.email,
				features: createdAdminUser.features,
				created_at: createdAdminUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});
		});
		test("With duplicated 'email' for self", async () => {
			const errorResponse = {
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro endereço de e-mail para realizar a atualização.",
				status_code: 400,
			};

			const createdAdminUser = await orchestrator.createAdminUser();
			const createdAdminSession = await orchestrator.createSession(
				createdAdminUser.id,
			);

			const anotherUser = await orchestrator.createUser();

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdAdminUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${createdAdminSession.token}`,
					},
					body: JSON.stringify({
						email: anotherUser.email,
					}),
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With new 'name' for self", async () => {
			const createdAdminUser = await orchestrator.createAdminUser();
			const createdAdminSession = await orchestrator.createSession(
				createdAdminUser.id,
			);
			const newName = "Admin New Name";

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdAdminUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${createdAdminSession.token}`,
					},
					body: JSON.stringify({
						name: newName,
					}),
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdAdminUser.id,
				name: newName,
				email: createdAdminUser.email,
				features: createdAdminUser.features,
				created_at: createdAdminUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});
		});
		test("With new unique 'email' for self", async () => {
			const createdAdminUser = await orchestrator.createAdminUser();
			const createdAdminSession = await orchestrator.createSession(
				createdAdminUser.id,
			);
			const newEmail = "newAdminEmail@gmail.com";

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${createdAdminUser.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${createdAdminSession.token}`,
					},
					body: JSON.stringify({
						email: newEmail,
					}),
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdAdminUser.id,
				name: createdAdminUser.name,
				email: newEmail,
				features: createdAdminUser.features,
				created_at: createdAdminUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(new Date(responseBody.updated_at).getTime()).toBeGreaterThan(
				createdAdminUser.updated_at.getTime(),
			);
		});
	});
});
