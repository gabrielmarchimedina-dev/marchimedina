import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import { faker } from "@faker-js/faker";
import user from "models/user";
import session from "models/session";
import {
	PublicUserRecord,
	CreateTestUserInput,
	UserRecord,
} from "models/user/types";
import { TestTeamMemberInput } from "models/teamMember/types";
import { SessionRecord } from "models/session/types";
import activation from "models/activation";
import FEATURES from "infra/features";
import teamMember from "models/teamMember";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
	await waitForWebServer();

	async function waitForWebServer() {
		return retry(fetchStatusPage, {
			retries: 100,
			maxTimeout: 1000,
		});

		async function fetchStatusPage() {
			const response = await fetch("http://localhost:3000/api/v1/status");
			if (response.status !== 200) {
				throw Error();
			}
		}
	}
}

async function clearDatabase() {
	await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
	await migrator.runPendingMigrations();
}

async function createUser(
	userObject?: CreateTestUserInput,
): Promise<PublicUserRecord> {
	if (!userObject) {
		userObject = {
			name: faker.person.fullName().replace(/[_.0]/g, ""),
			email: faker.internet.email(),
			password: "ValidPassword123@",
		};
	}
	return await user.create({
		name: userObject.name || faker.person.fullName().replace(/[_.0]/g, ""),
		email: userObject.email || faker.internet.email(),
		password: userObject.password || "ValidPassword123@",
	});
}

async function createAdminUser(
	userObject?: CreateTestUserInput,
): Promise<PublicUserRecord> {
	if (!userObject) {
		userObject = {
			name: faker.person.fullName().replace(/[_.0]/g, ""),
			email: faker.internet.email(),
			password: "ValidPassword123@",
		};
	}
	let createdUser = await user.create({
		name: userObject.name || faker.person.fullName().replace(/[_.0]/g, ""),
		email: userObject.email || faker.internet.email(),
		password: userObject.password || "ValidPassword123@",
	});

	createdUser = await user.setFeatures(
		createdUser.id,
		FEATURES.ADMIN_USER_FEATURES,
	);

	return createdUser;
}

async function createManagerUser(
	userObject?: CreateTestUserInput,
): Promise<PublicUserRecord> {
	if (!userObject) {
		userObject = {
			name: faker.person.fullName().replace(/[_.0]/g, ""),
			email: faker.internet.email(),
			password: "ValidPassword123@",
		};
	}
	let createdUser = await user.create({
		name: userObject.name || faker.person.fullName().replace(/[_.0]/g, ""),
		email: userObject.email || faker.internet.email(),
		password: userObject.password || "ValidPassword123@",
	});

	createdUser = await user.setFeatures(
		createdUser.id,
		FEATURES.MANAGER_USER_FEATURES,
	);

	return createdUser;
}

async function createSession(userId: string): Promise<SessionRecord> {
	return await session.create(userId);
}

async function activateUser(
	inactiveUserId: string,
	passwords?: { password: string; confirmPassword: string },
): Promise<UserRecord> {
	if (!passwords) {
		passwords = {
			password: "ValidPassword123@",
			confirmPassword: "ValidPassword123@",
		};
	}
	const activatedUser = await activation.activateUserByUserId(
		inactiveUserId,
		passwords,
	);
	return { ...activatedUser, password: passwords.password };
}

async function deleteAllEmails(): Promise<void> {
	await fetch(`${emailHttpUrl}/messages`, {
		method: "DELETE",
	});
}

async function getLastEmail() {
	const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
	const emailListBody = await emailListResponse.json();
	const lastEmailItem = emailListBody.pop();

	if (!lastEmailItem) {
		return null;
	}

	const emailTextResponse = await fetch(
		`${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
	);
	const emailTextBody = await emailTextResponse.text();

	lastEmailItem.text = emailTextBody;
	return lastEmailItem;
}

async function createTeamMember(teamMemberObject?: TestTeamMemberInput) {
	if (!teamMemberObject) {
		teamMemberObject = {
			name: faker.person.fullName().replace(/[_.0]/g, ""),
			email: faker.internet.email(),
			oab_number: faker.string.numeric(10),
			education: "Law Degree",
			lattes_url: "http://lattes.cnpq.br/1234567890123456",
			bio: faker.lorem.paragraph(),
			languages: ["Portuguese", "English"],
			image_url: "http://example.com/image.jpg",
			role: "Lawyer",
			instagram: "http://instagram.com/example",
			linkedin: "http://linkedin.com/in/example",
		};
	}
	return await teamMember.create({
		name:
			teamMemberObject.name ||
			faker.person.fullName().replace(/[_.0]/g, ""),
		email: teamMemberObject.email || faker.internet.email(),
		oab_number: teamMemberObject.oab_number || faker.string.numeric(10),
		education: teamMemberObject.education || "Law Degree",
		lattes_url:
			teamMemberObject.lattes_url ||
			"http://lattes.cnpq.br/1234567890123456",
		bio: teamMemberObject.bio || faker.lorem.paragraph(),
		languages: teamMemberObject.languages || ["Portuguese", "English"],
		image_url: teamMemberObject.image_url || "http://example.com/image.jpg",
		role: teamMemberObject.role || "Lawyer",
		instagram: teamMemberObject.instagram || "http://instagram.com/example",
		linkedin: teamMemberObject.linkedin || "http://linkedin.com/in/example",
	});
}

function extractUUID(text: string): string | null {
	const match = text.match(
		/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/,
	);
	return match ? match[0] : null;
}

const orchestrator = {
	waitForAllServices,
	clearDatabase,
	runPendingMigrations,
	createUser,
	createAdminUser,
	createManagerUser,
	createSession,
	activateUser,
	createTeamMember,
	deleteAllEmails,
	getLastEmail,
	extractUUID,
};

export default orchestrator;
