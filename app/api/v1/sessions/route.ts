import { methodNotAllowed } from "infra/http/response";
import { NextRequest, NextResponse } from "next/server";
import authentication from "models/authentication";
import authorization from "models/authorization";
import controller from "infra/controller";
import session from "models/session";
import { ForbiddenError } from "infra/errors";
import FEATURES from "infra/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = controller.withAuth(FEATURES.LIST.CREATE_SESSION)(async (
	request: NextRequest,
) => {
	const userInputValues = await request.json();

	const authenticatedUser = await authentication.getAuthenticatedUser(
		userInputValues.email,
		userInputValues.password,
	);

	if (!authorization.can(authenticatedUser, FEATURES.LIST.CREATE_SESSION)) {
		throw new ForbiddenError({
			message: "Você não possui permissão para fazer login.",
			action: "Contate o suporte caso acredite que isso é um erro.",
		});
	}

	const newSession = await session.create(authenticatedUser.id);

	const response = NextResponse.json(newSession, { status: 201 });
	controller.setSessionCookie(newSession.token, response);

	return response;
});

export const DELETE = controller.withAuth(FEATURES.LIST.DELETE_SESSION)(async (
	request: NextRequest,
) => {
	const sessionToken = request.cookies.get("session_id").value;
	const sessionObject = await session.findOneValidByToken(sessionToken);
	const expiredSession = await session.expireById(sessionObject.id);

	const response = NextResponse.json(expiredSession, { status: 200 });
	controller.clearSessionCookie(response);

	return response;
});

const notAllowed = () => methodNotAllowed(["POST", "DELETE"]);
export { notAllowed as GET, notAllowed as PUT, notAllowed as PATCH };
