import { methodNotAllowed } from "infra/http/response";
import { NextRequest, NextResponse } from "next/server";
import controller from "infra/controller";
import FEATURES from "infra/features";
import teamMember from "models/teamMember";
import image from "models/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = controller.withAuth(FEATURES.LIST.READ_TEAM_MEMBER)(async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id: memberId } = await params;
	const teamMemberRecord = await teamMember.findOneById(memberId);
	const response = NextResponse.json(teamMemberRecord, { status: 200 });

	return response;
});

export const PATCH = controller.withAuth(FEATURES.LIST.UPDATE_TEAM_MEMBER)(
	async (
		request: NextRequest,
		{ params }: { params: Promise<{ id: string }> },
	) => {
		const { id: memberId } = await params;

		// Busca o membro atual para pegar a imagem antiga
		const existingMember = await teamMember.findOneById(memberId);
		const oldImageUrl = existingMember.image_url;

		// Recebe FormData
		const formData = await request.formData();

		// Pega o arquivo (se tiver)
		const file = formData.get("file") as File | null;

		// Pega os outros dados
		const name = formData.get("name") as string | null;
		const email = formData.get("email") as string | null;
		const oab_number = formData.get("oab_number") as string | null;
		const education = formData.get("education") as string | null;
		const lattes_url = formData.get("lattes_url") as string | null;
		const bio = formData.get("bio") as string | null;
		const languagesStr = formData.get("languages") as string | null;
		const role = formData.get("role") as string | null;
		const instagram = formData.get("instagram") as string | null;
		const linkedin = formData.get("linkedin") as string | null;

		// Monta o objeto de update
		const updateData: any = {};

		if (name) updateData.name = name;
		if (email !== null)
			updateData.email = email.trim() === "" ? null : email;
		if (oab_number !== null)
			updateData.oab_number =
				oab_number.trim() === "" ? null : oab_number;
		if (education !== null)
			updateData.education = education.trim() === "" ? null : education;
		if (lattes_url !== null)
			updateData.lattes_url =
				lattes_url.trim() === "" ? null : lattes_url;
		if (bio !== null) updateData.bio = bio.trim() === "" ? null : bio;
		if (languagesStr !== null) {
			updateData.languages =
				languagesStr.trim() === ""
					? null
					: languagesStr.split(",").map((lang) => lang.trim());
		}
		if (role) updateData.role = role;
		if (instagram !== null)
			updateData.instagram = instagram.trim() === "" ? null : instagram;
		if (linkedin !== null)
			updateData.linkedin = linkedin.trim() === "" ? null : linkedin;

		// Se tem novo arquivo, faz upload
		if (file) {
			const uploadResult = await image.uploadFile(file, {
				entityType: "team_member",
			});
			updateData.image_url = uploadResult.path;

			// Verifica se a imagem antiga pode ser deletada
			if (oldImageUrl && !oldImageUrl.includes("default")) {
				const usageCount =
					await teamMember.findImageUsageCount(oldImageUrl);
				// Se só este membro usa a imagem (usageCount === 1), pode deletar
				if (usageCount === 1) {
					try {
						await image.deleteFile(oldImageUrl);
					} catch (error) {
						console.error("Erro ao deletar imagem antiga:", error);
						// Não interrompe o fluxo se falhar ao deletar
					}
				}
			}
		}

		// Atualiza o team member
		const updatedTeamMember = await teamMember.update(memberId, updateData);

		const response = NextResponse.json(updatedTeamMember, { status: 200 });

		return response;
	},
);

const notAllowed = () => methodNotAllowed(["GET", "PATCH"]);
export { notAllowed as POST, notAllowed as PUT, notAllowed as DELETE };
