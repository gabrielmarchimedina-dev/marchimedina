import { CreateUserInput } from "models/user/types";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import FEATURES from "infra/features";
import fs from "fs";
import path from "path";

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

afterAll(async () => {
	// Limpa as imagens de teste após todos os testes
	const testImagesPath = path.join(
		process.cwd(),
		"public/assets/images/teamMembers",
	);
	try {
		const files = await fs.promises.readdir(testImagesPath);
		for (const file of files) {
			// Remove todas as imagens, exceto se houver uma padrão "default"
			if (!file.includes("default") && file.endsWith(".png")) {
				await fs.promises.unlink(path.join(testImagesPath, file));
			}
		}
	} catch (error) {
		// Ignora erro se pasta não existir
	}
});

async function createTestImageFile(filename: string): Promise<File> {
	const buffer = Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
		"base64",
	);
	const blob = new Blob([buffer], { type: "image/png" });
	return new File([blob], filename, { type: "image/png" });
}

describe("POST /api/v1/users", () => {
	describe("Anonymous User", () => {
		test("With unique and valid data", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: "Verifique se o seu usuário possui a feature 'create:team_member'",
				status_code: 403,
			};

			const testFile = await createTestImageFile("test.png");

			const formData = new FormData();
			formData.append("name", "Team Member");
			formData.append("email", "team_member@gmail.com");
			formData.append("role", "Advogado");
			formData.append("file", testFile);

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					body: formData,
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Logged User with no permission", () => {
		test("With unique and valid data", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: "Verifique se o seu usuário possui a feature 'create:team_member'",
				status_code: 403,
			};

			const testFile = await createTestImageFile("test.png");

			const user = await orchestrator.createUser();

			await orchestrator.activateUser(user.id);

			const session = await orchestrator.createSession(user.id);

			const formData = new FormData();
			formData.append("name", "Team Member");
			formData.append("email", "team_member@gmail.com");
			formData.append("role", "Advogado");
			formData.append("file", testFile);

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${session.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});
	describe("Admin User", () => {
		test("with duplicated invalid data", async () => {
			expect(true).toBe(true);
		});
		test("with duplicated email", async () => {
			const errorResponse = {
				name: "ValidationError",
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				action: "Utilize outro e-mail para realizar a operação",
				status_code: 400,
			};

			const adminUser = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(adminUser.id);

			const testFile1 = await createTestImageFile("test1.png");
			const formData1 = new FormData();
			formData1.append("name", "Existing Member");
			formData1.append("email", "existingEmail_member@gmail.com");
			formData1.append("role", "Advogado");
			formData1.append("file", testFile1);

			// Create the existing member first
			const createResponse = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData1,
				},
			);

			expect(createResponse.status).toBe(201);

			const testFile2 = await createTestImageFile("test2.png");
			const formData2 = new FormData();
			formData2.append("name", "New Existing Member");
			formData2.append("email", "existingEmail_member@gmail.com");
			formData2.append("role", "Advogado");
			formData2.append("file", testFile2);

			// Now try to create a new member with the same email
			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData2,
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("with duplicated OAB number", async () => {
			const errorResponse = {
				name: "ValidationError",
				message: "O número da OAB informado já está sendo utilizado.",
				action: "Utilize outro número da OAB para realizar a operação",
				status_code: 400,
			};

			const adminUser = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(adminUser.id);

			const testFile1 = await createTestImageFile("test1.png");
			const formData1 = new FormData();
			formData1.append("name", "Existing Member");
			formData1.append("email", "existingOab_member@gmail.com");
			formData1.append("oab_number", "123456");
			formData1.append("role", "Advogado");
			formData1.append("file", testFile1);

			// Create the existing member first
			const createResponse = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData1,
				},
			);

			expect(createResponse.status).toBe(201);

			const testFile2 = await createTestImageFile("test2.png");
			const formData2 = new FormData();
			formData2.append("name", "New Existing Member");
			formData2.append("email", "newOab_member@gmail.com");
			formData2.append("oab_number", "123456");
			formData2.append("role", "Advogado");
			formData2.append("file", testFile2);

			// Now try to create a new member with the same OAB number
			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData2,
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
		test("With unique and valid data (necessary only)", async () => {
			const adminUser = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(adminUser.id);

			const testFile = await createTestImageFile("test.png");
			const formData = new FormData();
			formData.append("name", "Team Member");
			formData.append("email", "new_member@gmail.com");
			formData.append("role", "Advogado");
			formData.append("file", testFile);

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(201);

			const responseBody = await response.json();

			expect(responseBody.id).toBeDefined();
			expect(responseBody.name).toBe("Team Member");
			expect(responseBody.email).toBe("new_member@gmail.com");
			expect(responseBody.role).toBe("Advogado");
			expect(responseBody.image_url).toMatch(
				/^assets\/images\/teamMembers\/\d+\.png$/,
			);
			expect(responseBody.oab_number).toBeNull();
			expect(responseBody.education).toBeNull();
			expect(responseBody.lattes_url).toBeNull();
			expect(responseBody.bio).toBeNull();
			expect(responseBody.languages).toBeNull();
			expect(responseBody.instagram).toBeNull();
			expect(responseBody.linkedin).toBeNull();
			expect(responseBody.active).toBe(true);
			expect(responseBody.created_at).toBeDefined();
			expect(responseBody.updated_at).toBeDefined();
		});
		test("with unique and valid data (all data)", async () => {
			const adminUser = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(adminUser.id);

			const testFile = await createTestImageFile("test-all-data.png");
			const formData = new FormData();
			formData.append("name", "New Member With All Data");
			formData.append("email", "all_data@gmail.com");
			formData.append("oab_number", "1234567");
			formData.append("education", "Law Degree");
			formData.append(
				"lattes_url",
				"http://lattes.cnpq.br/1234567890123456",
			);
			formData.append(
				"bio",
				"Experienced lawyer specializing in corporate law.",
			);
			formData.append("languages", "Portuguese, English");
			formData.append("role", "Advogado");
			formData.append("instagram", "http://instagram.com/lawyer");
			formData.append("linkedin", "http://linkedin.com/lawyer");
			formData.append("file", testFile);

			const response = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(201);

			const responseBody = await response.json();

			expect(responseBody.id).toBeDefined();
			expect(responseBody.name).toBe("New Member With All Data");
			expect(responseBody.email).toBe("all_data@gmail.com");
			expect(responseBody.oab_number).toBe("1234567");
			expect(responseBody.education).toBe("Law Degree");
			expect(responseBody.lattes_url).toBe(
				"http://lattes.cnpq.br/1234567890123456",
			);
			expect(responseBody.bio).toBe(
				"Experienced lawyer specializing in corporate law.",
			);
			expect(responseBody.languages).toEqual(["Portuguese", "English"]);
			expect(responseBody.image_url).toMatch(
				/^assets\/images\/teamMembers\/\d+\.png$/,
			);
			expect(responseBody.role).toBe("Advogado");
			expect(responseBody.instagram).toBe("http://instagram.com/lawyer");
			expect(responseBody.linkedin).toBe("http://linkedin.com/lawyer");
			expect(responseBody.active).toBe(true);
			expect(responseBody.created_at).toBeDefined();
			expect(responseBody.updated_at).toBeDefined();
		});
	});
});
