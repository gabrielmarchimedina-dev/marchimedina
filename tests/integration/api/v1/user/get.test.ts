import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import session from "models/session";
import setCookieParser from "set-cookie-parser";
import FEATURES from "infra/features";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
	describe("Authenticated user", () => {
		test("With valid session", async () => {
			const createdUser = await orchestrator.createUser();
			await orchestrator.activateUser(createdUser.id);

			const sessionObject = await orchestrator.createSession(
				createdUser.id,
			);

			const response = await fetch("http://localhost:3000/api/v1/user", {
				headers: {
					Cookie: `session_id=${sessionObject.token}`,
				},
			});
			expect(response.status).toBe(200);

			const cacheControl = response.headers.get("Cache-Control");
			expect(cacheControl).toBe("no-store, max-age=0, must-revalidate");

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdUser.id,
				name: createdUser.name,
				email: createdUser.email,
				features: FEATURES.DEFAULT_USER_FEATURES,
				created_at: createdUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			// Session Renewal Assertions
			const renewedSessionObject = await session.findOneValidByToken(
				sessionObject.token,
			);

			expect(
				renewedSessionObject.expires_at > sessionObject.expires_at,
			).toBe(true);
			expect(
				renewedSessionObject.updated_at > sessionObject.updated_at,
			).toBe(true);

			// Set-Cookie Assertions
			const parsedSetCookie = setCookieParser(response, { map: true });

			expect(parsedSetCookie.session_id).toMatchObject({
				name: "session_id",
				value: sessionObject.token,
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
		test("With nonexistent session", async () => {
			const nonExistentToken =
				"1bf0d15b774330154c6766af449c68a6362083f085b6082adef0e2414dd24bd6f3894fc83bb5b656d6fd30c3181b50dd";

			const errorResponse = {
				name: "UnauthorizedError",
				message: "Usuário não possui sessão ativa.",
				action: "Verifique se o usuário está logado, e tente novamente.",
				status_code: 401,
			};

			const response = await fetch("http://localhost:3000/api/v1/user", {
				headers: {
					Cookie: `session_id=${nonExistentToken}`,
				},
			});
			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With expiring session", async () => {
			jest.useFakeTimers({
				now: new Date(
					Date.now() - session.EXPIRATION_IN_MILLISECONDS + 1000 * 60,
				), // 1 minute before expiration
			});

			const createdUser = await orchestrator.createUser();
			await orchestrator.activateUser(createdUser.id);

			const sessionObject = await orchestrator.createSession(
				createdUser.id,
			);

			jest.useRealTimers();

			const response = await fetch("http://localhost:3000/api/v1/user", {
				headers: {
					Cookie: `session_id=${sessionObject.token}`,
				},
			});
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				id: createdUser.id,
				name: createdUser.name,
				email: createdUser.email,
				features: FEATURES.DEFAULT_USER_FEATURES,
				created_at: createdUser.created_at.toISOString(),
				updated_at: responseBody.updated_at,
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			// Session Renewal Assertions
			const renewedSessionObject = await session.findOneValidByToken(
				sessionObject.token,
			);

			expect(
				renewedSessionObject.expires_at > sessionObject.expires_at,
			).toBe(true);
			expect(
				renewedSessionObject.updated_at > sessionObject.updated_at,
			).toBe(true);

			// Set-Cookie Assertions
			const parsedSetCookie = setCookieParser(response, { map: true });

			expect(parsedSetCookie.session_id).toMatchObject({
				name: "session_id",
				value: sessionObject.token,
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
		test("With expired session", async () => {
			const errorResponse = {
				name: "UnauthorizedError",
				message: "Usuário não possui sessão ativa.",
				action: "Verifique se o usuário está logado, e tente novamente.",
				status_code: 401,
			};

			jest.useFakeTimers({
				now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
			});

			const createdUser = await orchestrator.createUser();

			const sessionObject = await orchestrator.createSession(
				createdUser.id,
			);

			jest.useRealTimers();

			const response = await fetch("http://localhost:3000/api/v1/user", {
				headers: {
					Cookie: `session_id=${sessionObject.token}`,
				},
			});
			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);

			const parsedSetCookie = setCookieParser(response, { map: true });

			expect(parsedSetCookie.session_id).toMatchObject({
				name: "session_id",
				value: "invalid",
				maxAge: -1,
				path: "/",
				httpOnly: true,
			});

			expect(parsedSetCookie.session_id.expires).toBeInstanceOf(Date);
			const cookieExpires = parsedSetCookie.session_id.expires.getTime();
			const now = Date.now();

			expect(cookieExpires).toBeLessThan(
				now + session.EXPIRATION_IN_MILLISECONDS,
			);
		});
	});
});
