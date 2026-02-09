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

export const PATCH = controller.withAuth(FEATURES.LIST.UPDATE_USER_PASSWORD)(
	async (
		request: RequestWithUser,
		context: { params: Promise<{ id: string }> },
	) => {
		const params = await context.params;
		const targetUserId = params.id;

		await controller.injectAnonymousOrUser(request);
		const currentUser = request.user;

		if (currentUser.id !== targetUserId) {
			throw new ForbiddenError({
				message:
					"Você não tem permissão para alterar a senha deste usuário.",
				action: "Verifique se você está logado com a conta correta.",
			});
		}

		const contentLength = request.headers.get("content-length");
		const userInputValues =
			contentLength && contentLength !== "0" ? await request.json() : {};

		const newPassword = await user.updatePassword(
			targetUserId,
			userInputValues,
		);

		const response = NextResponse.json(newPassword, { status: 200 });

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
