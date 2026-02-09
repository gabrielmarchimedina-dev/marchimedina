import { MethodNotAllowedError, InternalServerError } from "infra/errors";

/**
 * Retorna uma resposta JSON 405 (Method Not Allowed) padronizada
 * @param allowedMethods - Lista de métodos HTTP permitidos (ex: ['GET', 'HEAD'])
 */
export function methodNotAllowed(allowedMethods: string[] = ["GET"]) {
	const error = new MethodNotAllowedError();
	return Response.json(error.toJSON(), {
		status: error.statusCode,
		headers: { Allow: allowedMethods.join(", ") },
	});
}

/**
 * Retorna uma resposta JSON de erro padronizada
 * @param error - Instância de erro customizado com toJSON() e statusCode
 */
export function jsonError(error: { toJSON(): any; statusCode: number }) {
	return Response.json(error.toJSON(), {
		status: error.statusCode,
	});
}

/**
 * Trata erros genéricos e retorna resposta JSON 500
 * @param error - Erro capturado no catch
 */
export function handleError(error: any) {
	const publicError = new InternalServerError({
		cause: error,
		statusCode: error.statusCode,
	});
	console.error(publicError);

	return Response.json(publicError.toJSON(), {
		status: publicError.statusCode,
	});
}
