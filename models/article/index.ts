import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";
import { ArticleRecord, CreateArticleInput, UpdateArticleInput } from "./types";

async function findAll(options?: {
	includeInactive?: boolean;
}): Promise<ArticleRecord[]> {
	const includeInactive = options?.includeInactive ?? false;

	const results = await database.query({
		text: `
			SELECT
				*
			FROM
				article
			${includeInactive ? "" : "WHERE active = true"}
			ORDER BY
				created_at DESC
			;`,
	});

	return results.rows;
}

async function findOneById(articleId: string): Promise<ArticleRecord> {
	const articleRecord = await runSelectQuery(articleId);
	return articleRecord;

	async function runSelectQuery(articleId: string): Promise<ArticleRecord> {
		const results = await database.query({
			text: `
				SELECT
					*
				FROM
					article
				WHERE
					id = $1
					AND deleted_at IS NULL
				LIMIT 1
			;`,
			values: [articleId],
		});

		if (results.rowCount === 0) {
			throw new NotFoundError({
				message: "Artigo não encontrado.",
			});
		}

		return results.rows[0];
	}
}

async function create(
	articleInput: CreateArticleInput,
): Promise<ArticleRecord> {
	validateRequiredField(articleInput.title, "title");
	validateRequiredField(articleInput.subtitle, "subtitle");
	validateRequiredField(articleInput.thumbnail, "thumbnail");
	validateRequiredField(articleInput.text, "text");

	const normalizedInput = normalizeInput(articleInput);
	const newArticle = await runInsertQuery(normalizedInput);
	return newArticle;

	async function runInsertQuery(
		input: CreateArticleInput,
	): Promise<ArticleRecord> {
		const results = await database.query({
			text: `
				INSERT INTO article
					(title, subtitle, thumbnail, text, view_count, active, created_by, updated_by, authors, language)
				VALUES
					($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
				RETURNING
					*
			;`,
			values: [
				input.title,
				input.subtitle,
				input.thumbnail,
				input.text,
				input.view_count,
				input.active,
				input.created_by,
				input.updated_by,
				input.authors,
				input.language,
			],
		});

		return results.rows[0];
	}
}

function normalizeInput(input: CreateArticleInput): CreateArticleInput {
	const viewCount = input.view_count ?? 0;
	const active = input.active ?? true;
	const createdBy = input.created_by ?? null;
	const updatedBy = input.updated_by ?? createdBy;
	const authors = input.authors ?? null;
	const language = input.language ?? "portugues";

	return {
		...input,
		title: input.title.trim(),
		subtitle: input.subtitle.trim(),
		thumbnail: input.thumbnail.trim(),
		text: input.text.trim(),
		view_count: viewCount,
		active,
		created_by: createdBy,
		updated_by: updatedBy,
		authors,
		language,
	};
}

function validateRequiredField(value: string | undefined, fieldName: string) {
	if (!value || value.trim().length === 0) {
		throw new ValidationError({
			message: `O campo '${fieldName}' é obrigatório.`,
			action: "Preencha todos os campos obrigatórios e tente novamente.",
		});
	}
}

function validateOptionalField(value: string | undefined, fieldName: string) {
	if (value !== undefined && value.trim().length === 0) {
		throw new ValidationError({
			message: `O campo '${fieldName}' é obrigatório.`,
			action: "Preencha todos os campos obrigatórios e tente novamente.",
		});
	}
}

async function update(
	articleId: string,
	updateInput: UpdateArticleInput,
): Promise<ArticleRecord> {
	await findOneById(articleId);

	if (updateInput.title !== undefined) {
		validateOptionalField(updateInput.title, "title");
	}

	if (updateInput.subtitle !== undefined) {
		validateOptionalField(updateInput.subtitle, "subtitle");
	}

	if (updateInput.thumbnail !== undefined) {
		validateOptionalField(updateInput.thumbnail, "thumbnail");
	}

	if (updateInput.text !== undefined) {
		validateOptionalField(updateInput.text, "text");
	}

	const updatedArticle = await runUpdateQuery(articleId, updateInput);
	return updatedArticle;

	async function runUpdateQuery(
		articleId: string,
		updateInput: UpdateArticleInput,
	): Promise<ArticleRecord> {
		const updateFields: string[] = [];
		const updateValues: any[] = [];
		let paramCount = 1;

		if (updateInput.title !== undefined) {
			updateFields.push(`title = $${paramCount}`);
			updateValues.push(updateInput.title.trim());
			paramCount++;
		}

		if (updateInput.subtitle !== undefined) {
			updateFields.push(`subtitle = $${paramCount}`);
			updateValues.push(updateInput.subtitle.trim());
			paramCount++;
		}

		if (updateInput.thumbnail !== undefined) {
			updateFields.push(`thumbnail = $${paramCount}`);
			updateValues.push(updateInput.thumbnail.trim());
			paramCount++;
		}

		if (updateInput.text !== undefined) {
			updateFields.push(`text = $${paramCount}`);
			updateValues.push(updateInput.text.trim());
			paramCount++;
		}

		if (updateInput.active !== undefined) {
			updateFields.push(`active = $${paramCount}`);
			updateValues.push(updateInput.active);
			paramCount++;
		}

		if (updateInput.updated_by !== undefined) {
			updateFields.push(`updated_by = $${paramCount}`);
			updateValues.push(updateInput.updated_by);
			paramCount++;
		}

		if (updateInput.authors !== undefined) {
			updateFields.push(`authors = $${paramCount}`);
			updateValues.push(updateInput.authors);
			paramCount++;
		}

		if (updateInput.language !== undefined) {
			updateFields.push(`language = $${paramCount}`);
			updateValues.push(updateInput.language);
			paramCount++;
		}

		updateFields.push(`updated_at = NOW()`);
		updateValues.push(articleId);

		const results = await database.query({
			text: `
				UPDATE article
				SET ${updateFields.join(", ")}
				WHERE id = $${paramCount}
				RETURNING *
			;`,
			values: updateValues,
		});

		return results.rows[0];
	}
}

async function deactivate(articleId: string): Promise<ArticleRecord> {
	const existingArticle = await findOneById(articleId);

	if (!existingArticle.active) {
		throw new ValidationError({
			message: "Este artigo já está inativo.",
			action: "Verifique se o artigo selecionado está ativo antes de desativá-lo.",
		});
	}

	const results = await database.query({
		text: `
			UPDATE article
			SET 
				active = false,
				updated_at = NOW()
			WHERE id = $1
			RETURNING *
		;`,
		values: [articleId],
	});

	return results.rows[0];
}

const article = {
	findAll,
	findOneById,
	create,
	update,
	deactivate,
};

export default article;
