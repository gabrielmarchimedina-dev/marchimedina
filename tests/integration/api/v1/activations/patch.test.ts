import { version as uuidVersion } from "uuid";
import activation from "models/activation";
import orchestrator from "tests/orchestrator";
import user from "models/user";
import FEATURES from "infra/features";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/activations/[token_id]", () => {
	describe("Anonymous user", () => {
		test("With nonexistent token", async () => {
			const tokenId = "027bcdb0-43d9-41f7-bfdd-72e2643059bd";
			const errorResponse = {
				name: "NotFoundError",
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
				status_code: 404,
			};

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${tokenId}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
			expect(response.status).toBe(404);

			const responseBody = await response.json();
			expect(responseBody).toEqual(errorResponse);
		});
		test("With expired token", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
				status_code: 404,
			};

			jest.useFakeTimers({
				now: new Date(
					Date.now() - activation.EXPIRATION_IN_MILLISECONDS,
				),
			});

			const createdUser = await orchestrator.createUser();
			const expiredActivationToken = await activation.create(
				createdUser.id,
			);

			jest.useRealTimers();

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${expiredActivationToken.id}`,
				{
					method: "PATCH",
				},
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With valid token but without password", async () => {
			const errorResponse = {
				message: "É preciso que seja fornecida a senha.",
				name: "ValidationError",
				action: "Digite as senhas para continuar.",
				status_code: 400,
			};

			const createdUser = await orchestrator.createUser();

			const activationToken = await activation.create(createdUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With valid token but empty passwords", async () => {
			const firstUserPasswords = {
				password: "",
				confirmPassword: "",
			};

			const errorResponse = {
				message: "É preciso que seja fornecida a senha.",
				name: "ValidationError",
				action: "Digite as senhas para continuar.",
				status_code: 400,
			};

			const createdUser = await orchestrator.createUser();

			const activationToken = await activation.create(createdUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(firstUserPasswords),
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With valid token but mismatch passwords", async () => {
			const firstUserPasswords = {
				password: "Password123!",
				confirmPassword: "Password321!",
			};

			const errorResponse = {
				message: "As senhas informadas não coincidem.",
				name: "ValidationError",
				action: "Verifique as senhas informadas e tente novamente.",
				status_code: 400,
			};

			const createdUser = await orchestrator.createUser();

			const activationToken = await activation.create(createdUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(firstUserPasswords),
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With already used token", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
				status_code: 404,
			};

			const createdUser = await orchestrator.createUser();
			const activationToken = await activation.create(createdUser.id);

			const response1 = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						password: "Password123!",
						confirmPassword: "Password123!",
					}),
				},
			);

			expect(response1.status).toBe(200);

			const response2 = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
				},
			);

			expect(response2.status).toBe(404);

			const response2Body = await response2.json();

			expect(response2Body).toEqual(errorResponse);
		});
		test("With valid token", async () => {
			const createdUser = await orchestrator.createUser();

			const activationToken = await activation.create(createdUser.id);

			const firstUserPasswords = {
				password: "Password123!",
				confirmPassword: "Password123!",
			};

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(firstUserPasswords),
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: activationToken.id,
				used_at: responseBody.used_at,
				user_id: activationToken.user_id,
				expires_at: activationToken.expires_at.toISOString(),
				created_at: activationToken.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(uuidVersion(responseBody.user_id)).toBe(4);

			expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.used_at)).not.toBeNaN();

			const expiresAt = new Date(responseBody.expires_at);
			const createdAt = new Date(responseBody.created_at);

			expiresAt.setMilliseconds(0);
			createdAt.setMilliseconds(0);

			expect(expiresAt.getTime() - createdAt.getTime()).toBe(
				activation.EXPIRATION_IN_MILLISECONDS,
			);

			const activatedUser = await user.findOneById(responseBody.user_id);
			expect(activatedUser.features).toEqual(
				FEATURES.DEFAULT_USER_FEATURES,
			);
		});
		test("With valid token but already activated user", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não pode mais utilizar tokens de ativação",
				action: "Entre em contato com o suporte.",
				status_code: 403,
			};

			const createdUser = await orchestrator.createUser();
			await orchestrator.activateUser(createdUser.id);
			const activationToken = await activation.create(createdUser.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${activationToken.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						password: "Password123!",
						confirmPassword: "Password123!",
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Authenticated user", () => {
		test("With valid token, but already logged in user", async () => {
			const errorResponse = {
				message: "Você não possui permissão para executar esta ação.",
				name: "ForbiddenError",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.READ_ACTIVATION_TOKEN}'`,
				status_code: 403,
			};

			const user1 = await orchestrator.createUser();
			await orchestrator.activateUser(user1.id);
			const user1SessionObject = await orchestrator.createSession(
				user1.id,
			);

			const user2 = await orchestrator.createUser();
			const user2ActivationToken = await activation.create(user2.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/activations/${user2ActivationToken.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${user1SessionObject.token}`,
					},
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
});
