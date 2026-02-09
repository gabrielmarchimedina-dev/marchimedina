import { faker } from "@faker-js/faker";
import teamMember from "models/teamMember";
import { TeamMemberInput } from "models/teamMember/types";
require("dotenv").config({ path: ".env.development" });

faker.seed(20260202);

const TEAM_IMAGES = [
	"client/assets/images/about/advogado-1.jpg",
	"client/assets/images/about/advogado-2.jpg",
	"client/assets/images/about/advogado-3.jpg",
];
const LANGUAGES_POOL = [
	"Português",
	"Inglês",
	"Espanhol",
	"Francês",
	"Italiano",
];

const rolePlan = [
	{ role: "Advogado", count: 5 },
	{ role: "Consultor", count: 2 },
	{ role: "Estagiario", count: 2 },
];

function buildTeamMember(role: string, index: number): TeamMemberInput {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();
	const name = faker.person.fullName({ firstName, lastName });
	const email = `team.${role}.${index}.${faker.string.alphanumeric(6).toLowerCase()}@mm.com`;
	const education = faker.lorem.sentence({ min: 6, max: 12 });
	const bio = faker.lorem.paragraphs({ min: 2, max: 3 });
	const languages = faker.helpers.arrayElements(
		LANGUAGES_POOL,
		faker.number.int({ min: 1, max: 3 }),
	);
	const instagram = `https://instagram.com/${faker.internet.username().toLowerCase()}`;
	const linkedin = `https://linkedin.com/in/${faker.internet.username().toLowerCase()}`;
	const lattesUrl = `https://lattes.cnpq.br/${faker.string.numeric(10)}`;
	const oabNumber =
		role.toLowerCase() === "advigado"
			? `${faker.location.state({ abbreviated: true })}-${faker.string.numeric(6)}-${index}`
			: undefined;

	const image_url = TEAM_IMAGES[(index - 1) % TEAM_IMAGES.length];

	return {
		name,
		email,
		oab_number: oabNumber,
		education,
		lattes_url: lattesUrl,
		bio,
		languages,
		image_url,
		role,
		instagram,
		linkedin,
	};
}

async function seedTeamMembers() {
	try {
		const createdMembers: TeamMemberInput[] = [];
		let counter = 1;

		for (const { role, count } of rolePlan) {
			for (let i = 0; i < count; i += 1) {
				const member = buildTeamMember(role, counter);
				await teamMember.create(member);
				createdMembers.push(member);
				counter += 1;
			}
		}

		console.log(`✅ ${createdMembers.length} membros da equipe criados.`);
		process.exit(0);
	} catch (error) {
		console.error("❌ Erro ao criar membros da equipe:", error);
		process.exit(1);
	}
}

seedTeamMembers();
