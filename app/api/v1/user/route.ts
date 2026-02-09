import { methodNotAllowed } from "infra/http/response";
import { NextRequest, NextResponse } from "next/server";
import controller from "infra/controller";
import session from "models/session";
import user from "models/user";
import FEATURES from "infra/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = controller.withAuth(FEATURES.LIST.READ_USER_SELF)(async (
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) => {
	const sessionToken = request.cookies.get("session_id").value;

	const sessionObject = await session.findOneValidByToken(sessionToken);

	const userFound = await user.findOneById(sessionObject.user_id);

	const renewedSessionObject = await session.renew(sessionObject.id);

	const response = NextResponse.json(userFound, { status: 200 });
	controller.setSessionCookie(renewedSessionObject.token, response);

	response.headers.set(
		"Cache-Control",
		"no-store, max-age=0, must-revalidate",
	);

	return response;
});

const notAllowed = () => methodNotAllowed(["GET"]);
export {
	notAllowed as POST,
	notAllowed as PUT,
	notAllowed as PATCH,
	notAllowed as DELETE,
};
