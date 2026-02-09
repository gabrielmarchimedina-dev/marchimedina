import { methodNotAllowed } from "infra/http/response";
import { NextRequest, NextResponse } from "next/server";
import user from "models/user";
import controller from "infra/controller";
import FEATURES from "infra/features";
import activation from "models/activation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = controller.withAuth(FEATURES.LIST.READ_USER_OTHER)(async (
	request: NextRequest,
) => {
	const users = await user.findAll();
	return NextResponse.json(users, { status: 200 });
});

export const POST = controller.withAuth(FEATURES.LIST.CREATE_USER)(async (
	request: NextRequest,
) => {
	const userInputValues = await request.json();
	const newUser = await user.create(userInputValues);

	const activationToken = await activation.create(newUser.id);

	await activation.sendEmailToUser(newUser, activationToken);
	return NextResponse.json(newUser, { status: 201 });
});

const notAllowed = () => methodNotAllowed(["POST", "GET"]);
export { notAllowed as PUT, notAllowed as PATCH, notAllowed as DELETE };
