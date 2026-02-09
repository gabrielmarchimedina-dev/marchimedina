import database from "infra/database";
import { ArticleHistoryRecord, CreateArticleHistoryInput } from "./types";

async function findAllByArticleId(
	articleId: string,
): Promise<ArticleHistoryRecord[]> {
	const results = await database.query({
		text: `
			SELECT
				article_history.*,
				users.name AS edited_by_name
			FROM
				article_history
			LEFT JOIN
				users ON users.id = article_history.edited_by
			WHERE
				article_id = $1
				AND article_history.deleted_at IS NULL
			ORDER BY
				article_history.created_at DESC
			;`,
		values: [articleId],
	});

	return results.rows;
}

async function create(
	input: CreateArticleHistoryInput,
): Promise<ArticleHistoryRecord> {
	const results = await database.query({
		text: `
			INSERT INTO article_history
				(article_id, field, old_value, new_value, edited_by)
			VALUES
				($1, $2, $3, $4, $5)
			RETURNING
				*
		;`,
		values: [
			input.article_id,
			input.field,
			input.old_value,
			input.new_value,
			input.edited_by ?? null,
		],
	});

	return results.rows[0];
}

async function createMany(
	inputs: CreateArticleHistoryInput[],
): Promise<ArticleHistoryRecord[]> {
	const createdRecords: ArticleHistoryRecord[] = [];

	for (const input of inputs) {
		const record = await create(input);
		createdRecords.push(record);
	}

	return createdRecords;
}

const articleHistory = {
	findAllByArticleId,
	create,
	createMany,
};

export default articleHistory;
