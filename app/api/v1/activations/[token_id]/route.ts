import { methodNotAllowed } from "infra/http/response";
import controller from "infra/controller";
import activation from "models/activation";
import { NextRequest, NextResponse } from "next/server";
import FEATURES from "infra/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = controller.withAuth(FEATURES.LIST.READ_ACTIVATION_TOKEN)(
	async (
		request: NextRequest,
		context: { params: Promise<{ token_id: string }> },
	) => {
		const params = await context.params;
		const activationTokenId = params.token_id;

		const validActivationToken =
			await activation.findOneValidById(activationTokenId);

		const contentLength = request.headers.get("content-length");
		const firstPasswords =
			contentLength && contentLength !== "0" ? await request.json() : {};

		await activation.activateUserByUserId(
			validActivationToken.user_id,
			firstPasswords,
		);

		const usedActivationToken =
			await activation.markTokenAsUsed(activationTokenId);

		const response = NextResponse.json(usedActivationToken, {
			status: 200,
		});
		return response;
	},
);

const notAllowed = () => methodNotAllowed(["PATCH"]);
export { notAllowed as PUT, notAllowed as POST, notAllowed as DELETE };
