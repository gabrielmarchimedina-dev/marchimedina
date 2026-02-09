import FEATURES from "infra/features";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import teamMember from "models/teamMember";

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
		console.log("Erro ao limpar imagens de teste:", error);
	}
});

async function createTestImageFile(filename: string): Promise<File> {
	// Cria um buffer de imagem fake (1x1 pixel PNG)
	const buffer = Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
		"base64",
	);

	const blob = new Blob([buffer], { type: "image/png" });
	return new File([blob], filename, { type: "image/png" });
}

describe("PATCH /api/v1/team-members/[id]", () => {
	describe("Anonymous User", () => {
		test("Updating team member without auth", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.UPDATE_TEAM_MEMBER}'`,
				status_code: 403,
			};

			const teamMemberRecord = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("name", "Updated Name");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					body: formData,
				},
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});
	});

	describe("Logged User with no permission", () => {
		test("Updating team member", async () => {
			const errorResponse = {
				name: "ForbiddenError",
				message: "Você não possui permissão para executar esta ação.",
				action: `Verifique se o seu usuário possui a feature '${FEATURES.LIST.UPDATE_TEAM_MEMBER}'`,
				status_code: 403,
			};

			const user = await orchestrator.createUser();
			await orchestrator.activateUser(user.id);
			const session = await orchestrator.createSession(user.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("name", "Updated Name");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
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

	describe("Logged User with permission (Admin)", () => {
		test("Updating team member with valid data (name only)", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("name", "Updated Name");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(teamMemberRecord.id);
			expect(responseBody.name).toBe("Updated Name");
			expect(responseBody.email).toBe(teamMemberRecord.email);
			expect(responseBody.role).toBe(teamMemberRecord.role);
			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
			expect(responseBody.updated_at).not.toBe(responseBody.created_at);
		});

		test("Updating team member with multiple fields", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("name", "New Name");
			formData.append("role", "Senior Partner");
			formData.append("bio", "New bio text");
			formData.append("languages", "Portuguese,English,Spanish");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(teamMemberRecord.id);
			expect(responseBody.name).toBe("New Name");
			expect(responseBody.role).toBe("Senior Partner");
			expect(responseBody.bio).toBe("New bio text");
			expect(responseBody.languages).toEqual([
				"Portuguese",
				"English",
				"Spanish",
			]);
		});

		test("Updating team member with new image", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();
			const oldImageUrl = teamMemberRecord.image_url;

			const testFile = await createTestImageFile("new-photo.png");

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("file", testFile);

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(teamMemberRecord.id);
			expect(responseBody.image_url).not.toBe(oldImageUrl);
			expect(responseBody.image_url).toMatch(
				/^assets\/images\/teamMembers\/\d+\.png$/,
			);
		});

		test("Updating team member with duplicate email", async () => {
			const errorResponse = {
				name: "ValidationError",
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				action: "Utilize outro e-mail para realizar a operação",
				status_code: 400,
			};

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMember1 = await orchestrator.createTeamMember();
			const teamMember2 = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("email", teamMember2.email);

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMember1.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});

		test("Updating team member with duplicate OAB number", async () => {
			const errorResponse = {
				name: "ValidationError",
				message: "O número da OAB informado já está sendo utilizado.",
				action: "Utilize outro número da OAB para realizar a operação",
				status_code: 400,
			};

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMember1 = await orchestrator.createTeamMember();
			const teamMember2 = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("oab_number", teamMember2.oab_number);

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMember1.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(400);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});

		test("Updating team member with non-existing ID", async () => {
			const errorResponse = {
				name: "NotFoundError",
				message: "Membro da equipe não encontrado.",
				action: "Veririfique se os parâmetros utilizados na busca estão corretos.",
				status_code: 404,
			};

			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const nonExistingId = "00000000-0000-4000-8000-000000000000";

			const formData = new FormData();
			formData.append("name", "Updated Name");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${nonExistingId}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual(errorResponse);
		});

		test("Updating team member and keeping same email", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("name", "Updated Name");
			formData.append("email", teamMemberRecord.email); // Mesmo email

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.name).toBe("Updated Name");
			expect(responseBody.email).toBe(teamMemberRecord.email);
		});

		test("Updating team member and keeping same OAB number", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("name", "Updated Name");
			formData.append("oab_number", teamMemberRecord.oab_number); // Mesmo OAB

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.name).toBe("Updated Name");
			expect(responseBody.oab_number).toBe(teamMemberRecord.oab_number);
		});

		test("Clearing optional fields (email and oab_number)", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			// Verifica que o membro tem email e OAB
			expect(teamMemberRecord.email).toBeTruthy();
			expect(teamMemberRecord.oab_number).toBeTruthy();

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("email", ""); // Limpar email
			formData.append("oab_number", ""); // Limpar OAB

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.email).toBeNull();
			expect(responseBody.oab_number).toBeNull();
		});

		test("Clearing all optional fields", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("email", "");
			formData.append("oab_number", "");
			formData.append("education", "");
			formData.append("lattes_url", "");
			formData.append("bio", "");
			formData.append("languages", "");
			formData.append("instagram", "");
			formData.append("linkedin", "");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.name).toBe(teamMemberRecord.name);
			expect(responseBody.role).toBe(teamMemberRecord.role);
			expect(responseBody.email).toBeNull();
			expect(responseBody.oab_number).toBeNull();
			expect(responseBody.education).toBeNull();
			expect(responseBody.lattes_url).toBeNull();
			expect(responseBody.bio).toBeNull();
			expect(responseBody.languages).toBeNull();
			expect(responseBody.instagram).toBeNull();
			expect(responseBody.linkedin).toBeNull();
		});

		test("Clearing education field only", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			expect(teamMemberRecord.education).toBeTruthy();

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("education", "");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.education).toBeNull();
			expect(responseBody.email).toBe(teamMemberRecord.email);
			expect(responseBody.oab_number).toBe(teamMemberRecord.oab_number);
		});

		test("Clearing lattes_url field only", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			expect(teamMemberRecord.lattes_url).toBeTruthy();

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("lattes_url", "");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.lattes_url).toBeNull();
			expect(responseBody.email).toBe(teamMemberRecord.email);
		});

		test("Clearing bio field only", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			expect(teamMemberRecord.bio).toBeTruthy();

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("bio", "");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.bio).toBeNull();
			expect(responseBody.name).toBe(teamMemberRecord.name);
		});

		test("Clearing languages field only", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			expect(teamMemberRecord.languages).toBeTruthy();

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("languages", "");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.languages).toBeNull();
			expect(responseBody.name).toBe(teamMemberRecord.name);
		});

		test("Clearing instagram field only", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			expect(teamMemberRecord.instagram).toBeTruthy();

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("instagram", "");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.instagram).toBeNull();
			expect(responseBody.linkedin).toBe(teamMemberRecord.linkedin);
		});

		test("Clearing linkedin field only", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			expect(teamMemberRecord.linkedin).toBeTruthy();

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("linkedin", "");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.linkedin).toBeNull();
			expect(responseBody.instagram).toBe(teamMemberRecord.instagram);
		});

		test("Deleting unique image when updating with new image", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			const teamMemberRecord = await orchestrator.createTeamMember();
			const oldImageUrl = teamMemberRecord.image_url;

			const newTestFile = await createTestImageFile("new-unique.png");

			const formData = new FormData();
			formData.append("name", teamMemberRecord.name);
			formData.append("role", teamMemberRecord.role);
			formData.append("file", newTestFile);

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.image_url).not.toBe(oldImageUrl);
			expect(responseBody.image_url).toMatch(
				/^assets\/images\/teamMembers\/\d+\.png$/,
			);

			// Verifica que a imagem antiga foi deletada (tentando acessar o arquivo)
			const oldImagePath = path.join(
				process.cwd(),
				"public",
				oldImageUrl,
			);

			expect(fs.existsSync(oldImagePath)).toBe(false);
		});

		test("Not deleting shared image when one team member updates", async () => {
			const admin = await orchestrator.createAdminUser();
			const adminSession = await orchestrator.createSession(admin.id);

			// Cria dois membros que compartilham a mesma imagem
			const sharedImageFile = await createTestImageFile("shared.png");

			const formData1 = new FormData();
			formData1.append("name", "Member 1");
			formData1.append("email", "member1@test.com");
			formData1.append("role", "Advogado");
			formData1.append("file", sharedImageFile);

			const response1 = await fetch(
				"http://localhost:3000/api/v1/team-members",
				{
					method: "POST",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: formData1,
				},
			);

			const member1 = await response1.json();
			const sharedImageUrl = member1.image_url;

			// Atualiza o segundo membro para usar a mesma imagem do primeiro
			const member2Record = await orchestrator.createTeamMember();

			const sharedImagePath = path.join(
				process.cwd(),
				"public",
				sharedImageUrl,
			);

			// Simula que member2 usa a mesma imagem (update direto via model)
			await teamMember.update(member2Record.id, {
				image_url: sharedImageUrl,
			});

			// Agora membro 1 troca de imagem
			const newImageFile = await createTestImageFile("new-image.png");

			const updateMember1FormData = new FormData();
			updateMember1FormData.append("name", member1.name);
			updateMember1FormData.append("role", member1.role);
			updateMember1FormData.append("file", newImageFile);

			const updateResponse = await fetch(
				`http://localhost:3000/api/v1/team-members/${member1.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${adminSession.token}`,
					},
					body: updateMember1FormData,
				},
			);
			expect(fs.existsSync(sharedImagePath)).toBe(true);

			// Verifica que member2 ainda usa a imagem compartilhada
			const member2Check = await fetch(
				`http://localhost:3000/api/v1/team-members/${member2Record.id}`,
			);

			const member2Data = await member2Check.json();
			expect(member2Data.image_url).toBe(sharedImageUrl);
		});
	});

	describe("Logged User with permission (Manager)", () => {
		test("Updating team member with valid data", async () => {
			const manager = await orchestrator.createManagerUser();
			const managerSession = await orchestrator.createSession(manager.id);

			const teamMemberRecord = await orchestrator.createTeamMember();

			const formData = new FormData();
			formData.append("name", "Updated by Manager");
			formData.append("role", "Associate");

			const response = await fetch(
				`http://localhost:3000/api/v1/team-members/${teamMemberRecord.id}`,
				{
					method: "PATCH",
					headers: {
						Cookie: `session_id=${managerSession.token}`,
					},
					body: formData,
				},
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.id).toBe(teamMemberRecord.id);
			expect(responseBody.name).toBe("Updated by Manager");
			expect(responseBody.role).toBe("Associate");
		});
	});
});
