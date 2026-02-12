import FEATURES from "infra/features";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/articles/[id]", () => {
	describe("Anonymous User", () => {
		test("Deleting article without auth", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.DELETE_ARTICLE}'`,
				status_code: 403,
			};

			const articleRecord = await orchestrator.createArticle();

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
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
		test("Deleting article", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.DELETE_ARTICLE}'`,
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const articleRecord = await orchestrator.createArticle();

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
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
		test("Deleting article with valid ID", async () => {
			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const articleRecord = await orchestrator.createArticle();

			// Verifica que o artigo não está deletado
			expect(articleRecord.deleted_at).toBeNull();

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${managerSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(articleRecord.id);
			expect(responseBody.title).toBe(articleRecord.title);
			expect(responseBody.deleted_at).not.toBeNull();
			expect(responseBody.deleted_by).toBe(manager.id);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
			expect(Date.parse(responseBody.deleted_at)).not.toBeNaN();
		});

		test("Deleting already deleted article should return 404", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Artigo não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const articleRecord = await orchestrator.createArticle();

			// Primeira deleção
			await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${managerSession.token}`,
					},
				},
			);

			// Tenta deletar novamente
			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
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

		test("Deleting article with non-existing ID", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Artigo não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const nonExistingId = "00000000-0000-4000-8000-000000000000";

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${nonExistingId}`,
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
		test("Deleting article with valid ID", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const articleRecord = await orchestrator.createArticle();

			// Verifica que o artigo não está deletado
			expect(articleRecord.deleted_at).toBeNull();

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${articleRecord.id}`,
				{
					method: "DELETE",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(articleRecord.id);
			expect(responseBody.title).toBe(articleRecord.title);
			expect(responseBody.deleted_at).not.toBeNull();
			expect(responseBody.deleted_by).toBe(admin.id);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
			expect(Date.parse(responseBody.deleted_at)).not.toBeNaN();
		});

		test("Deleting article with non-existing ID", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Artigo não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const nonExistingId = "00000000-0000-4000-8000-000000000000";

			const response = await fetch(
				`http://localhost:3000/api/v1/articles/${nonExistingId}`,
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
