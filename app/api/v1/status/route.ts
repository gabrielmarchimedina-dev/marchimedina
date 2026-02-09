export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import database from "infra/database";
import { methodNotAllowed, handleError } from "infra/http/response";

export async function GET() {
	try {
		const updatedAt = new Date().toISOString();

		const dbVersion = (
			await database.query({ text: "SHOW server_version;" })
		).rows[0].server_version;

		const maxConnections = parseInt(
			(await database.query({ text: "SHOW max_connections;" })).rows[0]
				.max_connections,
		);

		const dbName = process.env.POSTGRES_DB;
		const openedConnections = (
			await database.query({
				text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
				values: [dbName],
			})
		).rows[0].count;

		return Response.json(
			{
				updated_at: updatedAt,
				dependencies: {
					database: {
						version: dbVersion,
						max_connections: maxConnections,
						opened_connections: openedConnections,
					},
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		return handleError(error);
	}
}

// Bloquear métodos não suportados com resposta JSON padronizada
const notAllowed = () => methodNotAllowed(["GET"]);
export {
	notAllowed as POST,
	notAllowed as PUT,
	notAllowed as PATCH,
	notAllowed as DELETE,
};
