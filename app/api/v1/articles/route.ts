import { methodNotAllowed } from "infra/http/response";
import { NextResponse } from "next/server";
import controller from "infra/controller";
import FEATURES from "infra/features";
import article from "models/article";
import image from "models/image";
import { ValidationError } from "infra/errors";
import { RequestWithUser } from "infra/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = controller.withAuth(FEATURES.LIST.READ_ARTICLE)(async (
	request: RequestWithUser,
) => {
	const includeInactive = request.user?.features?.includes(
		FEATURES.LIST.READ_INACTIVE_ARTICLE,
	);
	const articles = await article.findAll({ includeInactive });
	return NextResponse.json(articles, { status: 200 });
});

export const POST = controller.withAuth(FEATURES.LIST.CREATE_ARTICLE)(async (
	request: RequestWithUser,
) => {
	const formData = await request.formData();

	const title = formData.get("title") as string | null;
	const subtitle = formData.get("subtitle") as string | null;
	const text = formData.get("text") as string | null;
	const activeRaw = formData.get("active") as string | null;
	const languageRaw = formData.get("language") as string | null;
	const authorsRaw = formData.get("authors") as string | null;

	const thumbnailField = formData.get("thumbnail");
	const fileField = formData.get("file");

	let thumbnail: string | null = null;
	let file: File | null = null;

	if (thumbnailField instanceof File) {
		file = thumbnailField;
	} else if (typeof thumbnailField === "string") {
		thumbnail = thumbnailField;
	}

	if (!file && fileField instanceof File) {
		file = fileField;
	}

	if (file) {
		const uploadResult = await image.uploadFile(file, {
			entityType: "blog_post",
		});
		thumbnail = uploadResult.path;
	}

	if (!thumbnail) {
		throw new ValidationError({
			message: "O campo 'thumbnail' é obrigatório.",
			action: "Envie uma imagem ou informe o thumbnail do artigo.",
		});
	}

	const active = parseOptionalBoolean(activeRaw);
	const language = parseLanguage(languageRaw);
	const authors = parseAuthors(authorsRaw);

	const createdArticle = await article.create({
		title: title ?? "",
		subtitle: subtitle ?? "",
		text: text ?? "",
		thumbnail,
		active,
		language,
		authors,
		created_by: request.user?.id ?? null,
		updated_by: request.user?.id ?? null,
	});

	return NextResponse.json(createdArticle, { status: 201 });
});

function parseOptionalBoolean(value: string | null) {
	if (value === null || value.trim() === "") {
		return undefined;
	}

	const normalized = value.trim().toLowerCase();
	return normalized === "true" || normalized === "1";
}

function parseLanguage(
	value: string | null,
): "portugues" | "ingles" | "frances" | undefined {
	if (value === null || value.trim() === "") {
		return undefined;
	}
	const normalized = value.trim().toLowerCase();
	if (
		normalized === "portugues" ||
		normalized === "ingles" ||
		normalized === "frances"
	) {
		return normalized;
	}
	return undefined;
}

function parseAuthors(value: string | null): string[] | null {
	if (value === null || value.trim() === "") {
		return null;
	}
	try {
		const parsed = JSON.parse(value);
		if (Array.isArray(parsed)) {
			return parsed.filter(
				(id) => typeof id === "string" && id.trim() !== "",
			);
		}
		return null;
	} catch {
		return value
			.split(",")
			.map((id) => id.trim())
			.filter((id) => id !== "");
	}
}

const notAllowed = () => methodNotAllowed(["GET", "POST"]);
export { notAllowed as PUT, notAllowed as PATCH, notAllowed as DELETE };
