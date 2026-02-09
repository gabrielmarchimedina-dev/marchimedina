import { CreateUserInput } from "models/user/types";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import FEATURES from "infra/features";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
	describe("Authenticated User", () => {
		test("With unique and valid data", async () => {
			const uniqueUser: CreateUserInput = {
				name: "Unique Email User",
				email: "uniqueEmailUser@gmail.com",
				password: "Password@123",
			};

			const adminUser = await orchestrator.createAdminUser();
			const adminUserCreatedSession = await orchestrator.createSession(
				adminUser.id,
			);

			const response = await fetch("http://localhost:3000/api/v1/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session_id=${adminUserCreatedSession.token}`,
				},
				body: JSON.stringify(uniqueUser),
			});

			expect(response.status).toBe(201);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: uniqueUser.name,
				email: uniqueUser.email,
				id: responseBody.id,
				features: [FEATURES.LIST.READ_ACTIVATION_TOKEN],
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
		});
		test("With duplicated email", async () => {
			const duplicatedEmailUser1: CreateUserInput = {
				name: "Duplicated Email User 1",
				email: "duplicatedUserEmail@gmail.com",
				password: "Password@123",
			};

			const duplicatedEmailUser2: CreateUserInput = {
				name: "Duplicated Email User 2",
				email: "duplicatedUserEmail@gmail.com",
				password: "Password@123",
			};

			const errorResponse = {
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				name: "ValidationError",
				action: "Utilize outro e-mail para realizar a operação",
				status_code: 400,
			};

			const adminUser = await orchestrator.createAdminUser();
			const adminUserCreatedSession = await orchestrator.createSession(
				adminUser.id,
			);

			const response1 = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminUserCreatedSession.token}`,
					},
					body: JSON.stringify(duplicatedEmailUser1),
				},
			);

			expect(response1.status).toBe(201);

			const response2 = await fetch(
				"http://localhost:3000/api/v1/users",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${adminUserCreatedSession.token}`,
					},
					body: JSON.stringify(duplicatedEmailUser2),
				},
			);

			expect(response2.status).toBe(400);

			const responseBody = await response2.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
});
