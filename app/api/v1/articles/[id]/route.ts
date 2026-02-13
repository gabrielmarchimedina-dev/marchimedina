import { methodNotAllowed } from "infra/http/response";
import { NextResponse } from "next/server";
import controller from "infra/controller";
import FEATURES from "infra/features";
import article from "models/article";
import image from "models/image";
import teamMember from "models/teamMember";
import { ValidationError } from "infra/errors";
import articleHistory from "models/aticleHistory";
import { RequestWithUser } from "infra/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = controller.withAuth(FEATURES.LIST.READ_ARTICLE)(async (
	request,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id: articleId } = await params;
	const articleRecord = await article.findOneById(articleId);

	const authors = articleRecord.authors
		? await teamMember.findManyByIds(articleRecord.authors)
		: [];

	return NextResponse.json({ ...articleRecord, authors }, { status: 200 });
});

export const PATCH = controller.withAuth(FEATURES.LIST.UPDATE_ARTICLE)(async (
	request: RequestWithUser,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id: articleId } = await params;
	const existingArticle = await article.findOneById(articleId);
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

	if (thumbnail !== null && thumbnail.trim().length === 0) {
		throw new ValidationError({
			message: "O campo 'thumbnail' é obrigatório.",
			action: "Envie uma imagem ou informe o thumbnail do artigo.",
		});
	}

	const active = parseOptionalBoolean(activeRaw);
	const language = parseLanguage(languageRaw);
	const authors = parseAuthors(authorsRaw);

	const updateData: any = {};
	if (title !== null) updateData.title = title;
	if (subtitle !== null) updateData.subtitle = subtitle;
	if (text !== null) updateData.text = text;
	if (thumbnail !== null) updateData.thumbnail = thumbnail;
	if (active !== undefined) updateData.active = active;
	if (language !== undefined) updateData.language = language;
	if (authors !== null) updateData.authors = authors;
	updateData.updated_by = request.user?.id ?? null;

	const updatedArticle = await article.update(articleId, updateData);

	const historyEntries = buildHistoryEntries(
		existingArticle,
		updatedArticle,
		updateData.updated_by ?? null,
	);

	if (historyEntries.length > 0) {
		await articleHistory.createMany(historyEntries);
	}

	return NextResponse.json(updatedArticle, { status: 200 });
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

function buildHistoryEntries(before: any, after: any, editedBy: string | null) {
	const fields = [
		"title",
		"subtitle",
		"text",
		"thumbnail",
		"active",
		"language",
		"authors",
	] as const;
	const entries = [] as {
		article_id: string;
		field: string;
		old_value: string | null;
		new_value: string | null;
		edited_by: string | null;
	}[];

	for (const field of fields) {
		const oldValue = normalizeHistoryValue(before[field]);
		const newValue = normalizeHistoryValue(after[field]);
		if (oldValue !== newValue) {
			entries.push({
				article_id: before.id,
				field,
				old_value: oldValue,
				new_value: newValue,
				edited_by: editedBy,
			});
		}
	}

	return entries;
}

function normalizeHistoryValue(value: any): string | null {
	if (value === null || value === undefined) {
		return null;
	}
	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}
	if (Array.isArray(value)) {
		return JSON.stringify(value);
	}
	return String(value);
}

export const DELETE = controller.withAuth(FEATURES.LIST.DELETE_ARTICLE)(async (
	request: RequestWithUser,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id: articleId } = await params;
	const deactivatedArticle = await article.deactivate(articleId);
	return NextResponse.json(deactivatedArticle, { status: 200 });
});

const notAllowed = () => methodNotAllowed(["GET", "PATCH", "DELETE"]);
export { notAllowed as POST, notAllowed as PUT };
