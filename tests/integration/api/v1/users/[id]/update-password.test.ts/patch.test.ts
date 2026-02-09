import FEATURES from "infra/features";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[id]/update-password", () => {
	describe("Logged User Update Password", () => {
		test("With empty body", async () => {
			const updatePassword = {
				currentPassword: "",
				newPassword: "",
				confirmNewPassword: "",
			};

			const errorResponse = {
				name: "ValidationError",
				message: "Todos os campos de senha devem ser preenchidos.",
				action: "Preencha todos os campos e tente novamente.",
				status_code: 400,
			};

			const user = await orchestrator.createUser({
				password: updatePassword.currentPassword,
			});

			await orchestrator.activateUser(user.id);
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}/update-password`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
					body: JSON.stringify({}),
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("Wrong current password", async () => {
			const updatePassword = {
				currentPassword: "OldPassword123!",
				newPassword: "NewPassword123!",
				confirmNewPassword: "NewPassword123!",
			};

			const errorResponse = {
				name: "ValidationError",
				message: "A senha atual informada está incorreta.",
				action: "Verifique a senha informada e tente novamente.",
				status_code: 400,
			};

			const user = await orchestrator.createUser({
				password: updatePassword.currentPassword,
			});
			await orchestrator.activateUser(user.id, {
				password: updatePassword.currentPassword,
				confirmPassword: updatePassword.currentPassword,
			});
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}/update-password`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
					body: JSON.stringify({
						currentPassword: "IncorrectPassword123!",
						newPassword: updatePassword.newPassword,
						confirmNewPassword: updatePassword.confirmNewPassword,
					}),
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("Wrong new password confirmation", async () => {
			const updatePassword = {
				currentPassword: "OldPassword123!",
				newPassword: "NewPassword123!",
				confirmNewPassword: "NewPassword123!",
			};

			const errorResponse = {
				name: "ValidationError",
				message: "As senhas informadas não coincidem.",
				action: "Verifique as senhas informadas e tente novamente.",
				status_code: 400,
			};

			const user = await orchestrator.createUser({
				password: updatePassword.currentPassword,
			});
			await orchestrator.activateUser(user.id, {
				password: updatePassword.currentPassword,
				confirmPassword: updatePassword.currentPassword,
			});
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}/update-password`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
					body: JSON.stringify({
						currentPassword: updatePassword.currentPassword,
						newPassword: updatePassword.newPassword,
						confirmNewPassword: "IncorrectConfirmation123!",
					}),
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("Valid data", async () => {
			const updatePassword = {
				currentPassword: "OldPassword123!",
				newPassword: "NewPassword123!",
				confirmNewPassword: "NewPassword123!",
			};

			const errorResponse = {
				name: "ValidationError",
				message: "As novas senhas informadas não coincidem.",
				action: "Verifique as senhas informadas e tente novamente.",
				status_code: 400,
			};

			const user = await orchestrator.createUser({
				password: updatePassword.currentPassword,
			});
			await orchestrator.activateUser(user.id, {
				password: updatePassword.currentPassword,
				confirmPassword: updatePassword.currentPassword,
			});
			const userSession = await orchestrator.createSession(user.id);

			const response = await fetch(
				`http://localhost:3000/api/v1/users/${user.id}/update-password`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: `session_id=${userSession.token}`,
					},
					body: JSON.stringify({
						currentPassword: updatePassword.currentPassword,
						newPassword: updatePassword.newPassword,
						confirmNewPassword: updatePassword.confirmNewPassword,
					}),
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
		});
	});
});
