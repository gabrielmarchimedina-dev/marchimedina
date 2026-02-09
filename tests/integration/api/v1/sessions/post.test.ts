import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import session from "models/session";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
	describe("Anonymous user", () => {
		test("With incorrect 'email' but correct 'password", async () => {
			const userData = {
				email: "incorrectSessionLoginEmail@gmail.com",
				password: "Password@123",
			};

			const incorrectEmail = "incorrectEmail@gmail.com";

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Credenciais inválidas.",
				action: "Verifique se os dados enviados estão corretos.",
				status_code: 401,
			};

			await orchestrator.createUser(userData);

			const response = await fetch(
				`http://localhost:3000/api/v1/sessions`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: incorrectEmail,
						password: userData.password,
					}),
				},
			);

			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With correct 'email' but incorrect 'password'", async () => {
			const userData = {
				email: "correctSesseionEmail@gmail.com",
				password: "Password@123",
			};

			const incorrectPassword = "incorrectPassword@123";

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Credenciais inválidas.",
				action: "Verifique se os dados enviados estão corretos.",
				status_code: 401,
			};

			await orchestrator.createUser(userData);

			const response = await fetch(
				`http://localhost:3000/api/v1/sessions`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: userData.email,
						password: incorrectPassword,
					}),
				},
			);

			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With incorrect 'email' and incorrect 'password", async () => {
			const incorrectEmailPasswordSessionUser = {
				email: "incorrectEmailPasswordSessionUser@gmail.com",
				password: "password",
			};

			const incorrectEmailPassword = {
				email: "incorrectEmail@gmail.com",
				password: "incorrectPassword",
			};

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Credenciais inválidas.",
				action: "Verifique se os dados enviados estão corretos.",
				status_code: 401,
			};

			await orchestrator.createUser(incorrectEmailPasswordSessionUser);

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: incorrectEmailPassword.email,
						password: incorrectEmailPassword.password,
					}),
				},
			);

			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With correct 'email' and correct 'password'", async () => {
			const correctEmailPasswordUser = {
				email: "allcorrect@gmail.com",
				password: "allCorrectPassword",
			};

			const createdUser = await orchestrator.createUser(
				correctEmailPasswordUser,
			);

			const activatedUser = await orchestrator.activateUser(
				createdUser.id,
			);

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: correctEmailPasswordUser.email,
						password: activatedUser.password,
					}),
				},
			);

			expect(response.status).toBe(201);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				token: responseBody.token,
				user_id: createdUser.id,
				expires_at: responseBody.expires_at,
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			const expiresAt = new Date(responseBody.expires_at);
			const createdAt = new Date(responseBody.created_at);

			expiresAt.setMilliseconds(0);
			createdAt.setMilliseconds(0);

			expect(expiresAt.getTime() - createdAt.getTime()).toBe(
				session.EXPIRATION_IN_MILLISECONDS,
			);

			const parsedSetCookie = setCookieParser(response, { map: true });

			expect(parsedSetCookie.session_id).toMatchObject({
				name: "session_id",
				value: responseBody.token,
				maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
				path: "/",
				httpOnly: true,
			});

			expect(parsedSetCookie.session_id.expires).toBeInstanceOf(Date);
			const cookieExpires = parsedSetCookie.session_id.expires.getTime();
			const now = Date.now();

			expect(cookieExpires).toBeGreaterThan(
				now + session.EXPIRATION_IN_MILLISECONDS - 1000,
			);
			expect(cookieExpires).toBeLessThanOrEqual(
				now + session.EXPIRATION_IN_MILLISECONDS,
			);
		});
		test("With correct 'email' and correct password, but inactivated user", async () => {
			const correctEmailPasswordUser = {
				email: "allCorrectInactivated@gmail.com",
				password: "allCorrectPasswordInactivated@123",
			};

			const errorResponse = {
				message: "Você não possui permissão para fazer login.",
				name: "ForbiddenError",
				action: "Contate o suporte caso acredite que isso é um erro.",
				status_code: 403,
			};

			await orchestrator.createUser(correctEmailPasswordUser);

			const response = await fetch(
				"http://localhost:3000/api/v1/sessions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: correctEmailPasswordUser.email,
						password: correctEmailPasswordUser.password,
					}),
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
});
