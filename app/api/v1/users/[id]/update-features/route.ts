import { methodNotAllowed } from "infra/http/response";
import { NextRequest, NextResponse } from "next/server";
import user from "models/user";
import controller from "infra/controller";
import FEATURES from "infra/features";
import { RequestWithUser } from "infra/types";
import authorization from "models/authorization";
import { ForbiddenError, ValidationError } from "infra/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = controller.withAuth(FEATURES.LIST.UPDATE_USER_FEATURES)(
	async (
		request: RequestWithUser,
		context: { params: Promise<{ id: string }> },
	) => {
		const params = await context.params;
		const targetUserId = params.id;

		await controller.injectAnonymousOrUser(request);
		const currentUser = request.user;

		if (currentUser.id === targetUserId) {
			throw new ForbiddenError({
				message: "Você não pode editar suas próprias permissões.",
				action: "Peça para outro administrador fazer isso.",
			});
		}

		const targetUser = await user.findOneById(targetUserId);

		if (targetUser.features.includes(FEATURES.LIST.ADMIN)) {
			throw new ForbiddenError({
				message:
					"Não é possível editar permissões de um administrador.",
				action: "Esta operação é bloqueada por segurança.",
			});
		}

		if (
			targetUser.features.includes(FEATURES.LIST.UPDATE_USER_FEATURES) &&
			!currentUser.features.includes(FEATURES.LIST.ADMIN)
		) {
			throw new ForbiddenError({
				message: "Não é possível editar permissões de um gerente.",
				action: "Somente administradores podem fazer isso.",
			});
		}

		const contentLength = request.headers.get("content-length");
		let userInputValues =
			contentLength && contentLength !== "0" ? await request.json() : {};

		const { features } = userInputValues;

		if (
			features.includes(FEATURES.LIST.UPDATE_USER_FEATURES) &&
			!currentUser.features.includes(FEATURES.LIST.ADMIN)
		) {
			throw new ForbiddenError({
				message: "Não é possível editar permissões de um gerente.",
				action: "Somente administradores podem fazer isso.",
			});
		}

		if (!features || !Array.isArray(features)) {
			throw new ValidationError({
				message:
					"O campo 'features' é obrigatório e deve ser um array.",
				action: "Envie um array válido de features.",
			});
		}

		const updatedUser = await user.setFeatures(targetUserId, features);

		const response = NextResponse.json(updatedUser, { status: 200 });

		return response;
	},
);

const notAllowed = () => methodNotAllowed(["PATCH"]);
export {
	notAllowed as GET,
	notAllowed as PUT,
	notAllowed as POST,
	notAllowed as DELETE,
};
