import session from "models/session";
import { NextRequest, NextResponse } from "next/server";
import {
	InternalServerError,
	ValidationError,
	NotFoundError,
	UnauthorizedError,
	ForbiddenError,
} from "infra/errors";
import user from "models/user";
import authorization from "models/authorization";
import FEATURES from "infra/features";
import { RequestWithUser } from "infra/types";

type RouteHandler = (request: Request) => Promise<NextResponse>;
type RouteHandlerWithParams<T = any> = (
	request: Request,
	context: { params: T },
) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler;

export function withErrorHandler<T>(
	handler: RouteHandlerWithParams<T>,
): RouteHandlerWithParams<T>;

export function withErrorHandler(handler: any): any {
	return async (request: NextRequest, context?: any) => {
		// ← recebe context também
		try {
			return await handler(request, context); // ← passa ambos
		} catch (error: any) {
			return handleError(error, request);
		}
	};
}

function handleError(error: any, request: NextRequest): NextResponse {
	if (
		error instanceof ValidationError ||
		error instanceof NotFoundError ||
		error instanceof ForbiddenError
	) {
		return NextResponse.json(error.toJSON(), { status: error.statusCode });
	}
	if (error instanceof UnauthorizedError) {
		const response = NextResponse.json(error.toJSON(), {
			status: error.statusCode,
		});
		clearSessionCookie(response);
		return response;
	}

	const publicErrorObject = new InternalServerError({
		cause: error,
		statusCode: error.statusCode,
	});

	console.error(publicErrorObject);

	return NextResponse.json(publicErrorObject.toJSON(), {
		status: publicErrorObject.statusCode,
	});
}

function withAuth(feature: string) {
	return function (handler: any) {
		return withErrorHandler(
			async (request: RequestWithUser, context?: any) => {
				await injectAnonymousOrUser(request);

				canRequest(feature)(request);

				return await handler(request, context);
			},
		);
	};
}

function setSessionCookie(sessionToken: string, response: NextResponse): void {
	response.cookies.set("session_id", sessionToken, {
		path: "/",
		maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
	});
}

function clearSessionCookie(response: NextResponse): void {
	response.cookies.set("session_id", "invalid", {
		path: "/",
		maxAge: -1,
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
	});
}

async function injectAnonymousOrUser(request: RequestWithUser) {
	const sessionId = request.cookies.get("session_id")?.value;
	if (sessionId) {
		await injectAuthenticatedUser(request);
		return;
	}

	injectAnonymousUser(request);
	return;
}

async function injectAuthenticatedUser(request: RequestWithUser) {
	const sessionToken = request.cookies.get("session_id")?.value;
	const sessionObject = await session.findOneValidByToken(sessionToken);
	const userObject = await user.findOneById(sessionObject.user_id);

	request.user = userObject;
}

function injectAnonymousUser(request: RequestWithUser) {
	request.user = {
		features: FEATURES.ANONYMOUS_FEATURES,
	};
}

function canRequest(feature: string) {
	return function canRequestMiddleware(request: RequestWithUser) {
		const userTryingToRequest = request.user;
		if (authorization.can(userTryingToRequest, feature)) {
			return;
		}

		throw new ForbiddenError({
			message: "Você não possui permissão para executar esta ação.",
			action: `Verifique se o seu usuário possui a feature '${feature}'`,
		});
	};
}

const controller = {
	withErrorHandler,
	withAuth,
	setSessionCookie,
	clearSessionCookie,
	injectAnonymousOrUser,
	canRequest,
};

export default controller;
