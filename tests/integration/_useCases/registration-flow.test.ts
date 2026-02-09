import webserver from "infra/webserver";
import activation from "models/activation";
import orchestrator from "tests/orchestrator";
import { PublicUserRecord, UserRecord } from "models/user/types";
import user from "models/user";
import { SessionRecord } from "models/session/types";
import FEATURES from "infra/features";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
	await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
	let adminUser = {
		name: "Admin User",
		email: "admin@gmail.com",
		password: "Admin@1234",
	};

	let registratedUser = {
		name: "Registrated User",
		email: "registrated_email@gmail.com",
	};

	let adminToken: string;
	let createdUserResponseBody: UserRecord;
	let activationTokenId: string;
	let createdUserSession: SessionRecord;

	const userFirstPassword = {
		password: "Activate@1234",
		confirmPassword: "Activate@1234",
	};

	const userNewPassword = {
		currentPassword: userFirstPassword.password,
		newPassword: "NewPassword@1234",
		confirmNewPassword: "NewPassword@1234",
	};

	test("Admin log in", async () => {
		await orchestrator.createAdminUser(adminUser);

		const adminResponse = await fetch(
			"http://localhost:3000/api/v1/sessions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: adminUser.email,
					password: adminUser.password,
				}),
			},
		);

		expect(adminResponse.status).toBe(201);

		const adminResponseBody = await adminResponse.json();

		adminToken = adminResponseBody.token;
	});
	test("Admin create new user", async () => {
		const createUserResponse = await fetch(
			"http://localhost:3000/api/v1/users",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session_id=${adminToken}`,
				},
				body: JSON.stringify(registratedUser),
			},
		);

		expect(createUserResponse.status).toBe(201);

		createdUserResponseBody = await createUserResponse.json();

		expect(createdUserResponseBody).toEqual({
			id: createdUserResponseBody.id,
			name: registratedUser.name,
			email: registratedUser.email,
			features: createdUserResponseBody.features,
			created_at: createdUserResponseBody.created_at,
			updated_at: createdUserResponseBody.updated_at,
		});
	});
	test("Receive e-mail", async () => {
		const email = await orchestrator.getLastEmail();

		expect(email.sender).toBe("<contato@marchimedina.com.br>");
		expect(email.recipients[0]).toBe(`<${registratedUser.email}>`);
		expect(email.subject).toBe("Finalize seu cadastro no MarchiMedina");
		expect(email.text).toContain(registratedUser.name);

		activationTokenId = orchestrator.extractUUID(email.text || "");

		expect(email.text).toContain(
			`${webserver.origin}/admin/cadastro/ativar/${activationTokenId}`,
		);

		const activationTokenObject =
			await activation.findOneValidById(activationTokenId);

		expect(activationTokenObject.user_id).toBe(createdUserResponseBody.id);
		expect(activationTokenObject.used_at).toBe(null);
	});
	test("Activate account", async () => {
		const activationResponse = await fetch(
			`http://localhost:3000/api/v1/activations/${activationTokenId}`,
			{
				method: "PATCH",
				body: JSON.stringify({
					password: userFirstPassword.password,
					confirmPassword: userFirstPassword.confirmPassword,
				}),
			},
		);

		expect(activationResponse.status).toBe(200);

		const activationResponseBody = await activationResponse.json();

		expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

		const activatedUser = await user.findOneByEmail(registratedUser.email);

		expect(activatedUser.features).toEqual(FEATURES.DEFAULT_USER_FEATURES);
	});
	test("Login", async () => {
		const loginResponse = await fetch(
			"http://localhost:3000/api/v1/sessions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: registratedUser.email,
					password: "Activate@1234",
				}),
			},
		);

		expect(loginResponse.status).toBe(201);

		createdUserSession = await loginResponse.json();

		expect(createdUserSession.user_id).toBe(createdUserResponseBody.id);
	});
	test("Get user information", async () => {
		const sessionUser = await user.findOneById(createdUserSession.user_id);

		expect(sessionUser.id).toBe(createdUserResponseBody.id);
		expect(sessionUser.name).toBe(registratedUser.name);
		expect(sessionUser.email).toBe(registratedUser.email);
	});
	test("Change password", async () => {
		const sessionUser = await user.findOneById(createdUserSession.user_id);

		const response = await fetch(
			`http://localhost:3000/api/v1/users/${sessionUser.id}/update-password`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session_id=${createdUserSession.token}`,
				},
				body: JSON.stringify(userNewPassword),
			},
		);

		expect(response.status).toBe(200);
	});
	test("Login with old password should fail", async () => {
		const errorResponse = {
			name: "UnauthorizedError",
			message: "Credenciais inválidas.",
			action: "Verifique se os dados enviados estão corretos.",
			status_code: 401,
		};

		const sessionUser = await user.findOneById(createdUserSession.user_id);

		const loginResponse = await fetch(
			"http://localhost:3000/api/v1/sessions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: sessionUser.email,
					password: userFirstPassword.password,
				}),
			},
		);

		expect(loginResponse.status).toBe(401);

		const responseBody = await loginResponse.json();
		expect(responseBody).toEqual(errorResponse);
	});
	test("Login with new correct password", async () => {
		const sessionUser = await user.findOneById(createdUserSession.user_id);

		const loginResponse = await fetch(
			"http://localhost:3000/api/v1/sessions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: sessionUser.email,
					password: userNewPassword.newPassword,
				}),
			},
		);

		expect(loginResponse.status).toBe(201);

		const loginResponseBody = await loginResponse.json();

		expect(loginResponseBody.user_id).toBe(sessionUser.id);
	});
	afterAll(async () => {
		await orchestrator.clearDatabase();
		await orchestrator.deleteAllEmails();
	});
});
