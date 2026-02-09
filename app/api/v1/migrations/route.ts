import { methodNotAllowed } from "infra/http/response";
import migrator from "models/migrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const pendingMigrations = await migrator.listPendingMigrations();
	return Response.json(pendingMigrations, { status: 200 });
}

export async function POST() {
	const migratedMigrations = await migrator.runPendingMigrations();
	if (migratedMigrations.length > 0) {
		return Response.json(migratedMigrations, { status: 201 });
	}
	return Response.json(migratedMigrations, { status: 200 });
}

const notAllowed = () => methodNotAllowed(["GET", "POST"]);
export { notAllowed as PUT, notAllowed as PATCH, notAllowed as DELETE };
