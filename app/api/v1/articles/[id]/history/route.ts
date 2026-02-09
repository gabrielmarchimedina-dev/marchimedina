import { methodNotAllowed } from "infra/http/response";
import { NextResponse } from "next/server";
import controller from "infra/controller";
import FEATURES from "infra/features";
import articleHistory from "models/aticleHistory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = controller.withAuth(FEATURES.LIST.READ_ARTICLE)(async (
	request,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id: articleId } = await params;
	const history = await articleHistory.findAllByArticleId(articleId);
	return NextResponse.json(history, { status: 200 });
});

const notAllowed = () => methodNotAllowed(["GET"]);
export {
	notAllowed as POST,
	notAllowed as PUT,
	notAllowed as PATCH,
	notAllowed as DELETE,
};
