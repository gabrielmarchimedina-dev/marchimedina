import { methodNotAllowed } from "infra/http/response";
import { NextRequest, NextResponse } from "next/server";
import controller from "infra/controller";
import FEATURES from "infra/features";
import teamMember from "models/teamMember";
import image from "models/image";
import { RequestWithUser } from "infra/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = controller.withAuth(FEATURES.LIST.READ_TEAM_MEMBER)(async (
	request: RequestWithUser,
) => {
	const includeInactive = request.user?.features?.includes(
		FEATURES.LIST.READ_INACTIVE_TEAM_MEMBER,
	);
	const teamMembers = await teamMember.findAll({ includeInactive });
	const response = NextResponse.json(teamMembers, { status: 200 });

	return response;
});

export const POST = controller.withAuth(FEATURES.LIST.CREATE_TEAM_MEMBER)(
	async (request: NextRequest) => {
		// Recebe FormData ao invés de JSON
		const formData = await request.formData();

		// Pega o arquivo (se tiver)
		const file = formData.get("file") as File | null;

		// Pega os outros dados
		const name = formData.get("name") as string;
		const email = formData.get("email") as string | null;
		const oab_number = formData.get("oab_number") as string | null;
		const education = formData.get("education") as string | null;
		const lattes_url = formData.get("lattes_url") as string | null;
		const bio = formData.get("bio") as string | null;
		const languagesStr = formData.get("languages") as string | null;
		const role = formData.get("role") as string;
		const instagram = formData.get("instagram") as string | null;
		const linkedin = formData.get("linkedin") as string | null;

		// Processa languages
		const languages = languagesStr
			? languagesStr.split(",").map((lang) => lang.trim())
			: undefined;

		// Se tem arquivo, faz upload usando o model image
		let imageUrl = "assets/images/teamMembers/default.jpg"; // Imagem padrão
		if (file) {
			const uploadResult = await image.uploadFile(file, {
				entityType: "team_member",
			});
			imageUrl = uploadResult.path; // Ex: "assets/images/teamMembers/1738264800123.jpg"
		}

		// Cria o team member
		const newTeamMember = await teamMember.create({
			name,
			email: email || undefined,
			oab_number: oab_number || undefined,
			education: education || undefined,
			lattes_url: lattes_url || undefined,
			bio: bio || undefined,
			languages,
			image_url: imageUrl,
			role,
			instagram: instagram || undefined,
			linkedin: linkedin || undefined,
		});

		const response = NextResponse.json(newTeamMember, { status: 201 });

		return response;
	},
);

const notAllowed = () => methodNotAllowed(["GET", "POST"]);
export { notAllowed as PUT, notAllowed as PATCH, notAllowed as DELETE };
