import { methodNotAllowed } from "infra/http/response";
import { NextRequest, NextResponse } from "next/server";
import user from "models/user";
import controller from "infra/controller";
import FEATURES from "infra/features";
import { RequestWithUser } from "infra/types";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = controller.withAuth(FEATURES.LIST.READ_USER)(async (
	request: RequestWithUser,
	context: { params: Promise<{ id: string }> },
) => {
	const params = await context.params;
	const targetUserId = params.id;

	await controller.injectAnonymousOrUser(request);
	const currentUser = request.user;

	const isSelf = currentUser.id === targetUserId;

	if (isSelf) {
		if (!authorization.can(currentUser, FEATURES.LIST.READ_USER_SELF)) {
			throw new ForbiddenError({
				message: "Você não tem permissão para ler seu perfil",
				action: `Verifique se seu usuário possui a feature '${FEATURES.LIST.READ_USER_SELF}'`,
			});
		}
	} else {
		if (!authorization.can(currentUser, FEATURES.LIST.READ_USER_OTHER)) {
			throw new ForbiddenError({
				message:
					"Você não tem permissão para ler o perfil de outros usuários",
				action: `Verifique se seu usuário possui a feature '${FEATURES.LIST.READ_USER_OTHER}'`,
			});
		}
	}

	const userRecord = await user.findOneById(targetUserId);
	return NextResponse.json(userRecord);
});

export const PATCH = controller.withAuth(FEATURES.LIST.UPDATE_USER)(async (
	request: RequestWithUser,
	context: { params: Promise<{ id: string }> },
) => {
	const params = await context.params;
	const targetUserId = params.id;

	await controller.injectAnonymousOrUser(request);
	const currentUser = request.user;
	const targetUser = await user.findOneById(targetUserId);

	const isSelf = currentUser.id === targetUserId;

	if (targetUser.features.includes(FEATURES.LIST.ADMIN) && !isSelf) {
		throw new ForbiddenError({
			message: "Não é possível editar dados de um administrador.",
			action: "Esta operação é bloqueada por segurança.",
		});
	}

	if (
		targetUser.features.includes(FEATURES.LIST.UPDATE_USER_FEATURES) &&
		!currentUser.features.includes(FEATURES.LIST.ADMIN) &&
		!isSelf
	) {
		throw new ForbiddenError({
			message: "Não é possível editar dados de um gerente.",
			action: "Somente administradores podem fazer isso.",
		});
	}

	if (isSelf) {
		if (!authorization.can(currentUser, FEATURES.LIST.UPDATE_USER_SELF)) {
			throw new ForbiddenError({
				message: "Você não pode atualizar seu próprio perfil",
				action: "Entre em contato com o suporte",
			});
		}
	} else {
		if (!authorization.can(currentUser, FEATURES.LIST.UPDATE_USER_OTHER)) {
			throw new ForbiddenError({
				message: "Você não pode atualizar o perfil de outros usuários",
				action: "Entre em contato com o suporte",
			});
		}
	}

	const contentLength = request.headers.get("content-length");
	const userInputValues =
		contentLength && contentLength !== "0" ? await request.json() : {};

	const userRecord = await user.update(targetUserId, userInputValues);
	return NextResponse.json(userRecord);
});

const notAllowed = () => methodNotAllowed(["GET", "PATCH"]);
export { notAllowed as PUT, notAllowed as POST, notAllowed as DELETE };
