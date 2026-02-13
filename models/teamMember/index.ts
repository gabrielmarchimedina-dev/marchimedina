import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";
import {
	TeamMemberInput,
	TeamMemberRecord,
	TeamMemberUpdateInput,
} from "./types";

async function findAll(options?: {
	includeInactive?: boolean;
}): Promise<TeamMemberRecord[]> {
	const includeInactive = options?.includeInactive ?? false;

	const results = await database.query({
		text: `
			SELECT
				*
			FROM
				team_members
			${includeInactive ? "" : "WHERE active = true"}
			ORDER BY
				name ASC
			;`,
		values: [],
	});

	return results.rows;
}

async function findOneById(memberId: string): Promise<TeamMemberRecord | null> {
	const teamMember = await runSelectQuery(memberId);
	return teamMember;

	async function runSelectQuery(memberId: string): Promise<TeamMemberRecord> {
		const results = await database.query({
			text: `
			SELECT
				*
			FROM
				team_members
			WHERE
				id = $1
			;`,
			values: [memberId],
		});

		if (results.rowCount === 0) {
			throw new NotFoundError({
				message: "Membro da equipe não encontrado.",
			});
		}

		return results.rows[0];
	}
}

async function create(
	teamMemberInput: TeamMemberInput,
): Promise<TeamMemberRecord> {
	await validateUniqueEmail(teamMemberInput.email);

	if (teamMemberInput.oab_number) {
		await validateUniqueOabNumber(teamMemberInput.oab_number);
	}

	const createdTeamMember = await runInsertQuery(teamMemberInput);

	return createdTeamMember;

	async function runInsertQuery(
		teamMemberInput: TeamMemberInput,
	): Promise<TeamMemberRecord> {
		const results = await database.query({
			text: `
                INSERT INTO team_members
                    (name, 
					email, 
					oab_number, 
					education, 
					lattes_url, 
					bio, 
					languages, 
					image_url, 
					role, 
					instagram, 
					linkedin,
					active)
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING
                    *
                ;`,
			values: [
				teamMemberInput.name,
				teamMemberInput.email,
				teamMemberInput.oab_number,
				teamMemberInput.education,
				teamMemberInput.lattes_url,
				teamMemberInput.bio,
				teamMemberInput.languages,
				teamMemberInput.image_url,
				teamMemberInput.role,
				teamMemberInput.instagram,
				teamMemberInput.linkedin,
				teamMemberInput.active ?? true,
			],
		});

		return results.rows[0];
	}

	async function validateUniqueEmail(email: string, action?: string) {
		const results = await database.query({
			text: `
                SELECT 
                    email
                FROM
                    team_members
                WHERE
                    LOWER(email) = LOWER($1)
                ;`,
			values: [email],
		});
		if (results.rowCount > 0) {
			throw new ValidationError({
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				action:
					action ?? "Utilize outro e-mail para realizar a operação",
			});
		}
	}

	async function validateUniqueOabNumber(oabNumber: string, action?: string) {
		const results = await database.query({
			text: `
                SELECT 
                    oab_number
                FROM
                    team_members
                WHERE
                    LOWER(oab_number) = LOWER($1)
                ;`,
			values: [oabNumber],
		});
		if (results.rowCount > 0) {
			throw new ValidationError({
				message: "O número da OAB informado já está sendo utilizado.",
				action:
					action ??
					"Utilize outro número da OAB para realizar a operação",
			});
		}
	}
}

async function update(
	memberId: string,
	updateInput: TeamMemberUpdateInput,
): Promise<TeamMemberRecord> {
	const existingMember = await findOneById(memberId);

	if (updateInput.email && updateInput.email !== existingMember.email) {
		await validateUniqueEmail(updateInput.email, memberId);
	}

	if (
		updateInput.oab_number &&
		updateInput.oab_number !== existingMember.oab_number
	) {
		await validateUniqueOabNumber(updateInput.oab_number, memberId);
	}

	const updatedTeamMember = await runUpdateQuery(memberId, updateInput);

	return updatedTeamMember;

	async function runUpdateQuery(
		memberId: string,
		updateInput: TeamMemberUpdateInput,
	): Promise<TeamMemberRecord> {
		const updateFields: string[] = [];
		const updateValues: any[] = [];
		let paramCount = 1;

		if (updateInput.name !== undefined) {
			updateFields.push(`name = $${paramCount}`);
			updateValues.push(updateInput.name);
			paramCount++;
		}

		if (updateInput.email !== undefined) {
			updateFields.push(`email = $${paramCount}`);
			updateValues.push(updateInput.email);
			paramCount++;
		}

		if (updateInput.oab_number !== undefined) {
			updateFields.push(`oab_number = $${paramCount}`);
			updateValues.push(updateInput.oab_number);
			paramCount++;
		}

		if (updateInput.education !== undefined) {
			updateFields.push(`education = $${paramCount}`);
			updateValues.push(updateInput.education);
			paramCount++;
		}

		if (updateInput.lattes_url !== undefined) {
			updateFields.push(`lattes_url = $${paramCount}`);
			updateValues.push(updateInput.lattes_url);
			paramCount++;
		}

		if (updateInput.bio !== undefined) {
			updateFields.push(`bio = $${paramCount}`);
			updateValues.push(updateInput.bio);
			paramCount++;
		}

		if (updateInput.languages !== undefined) {
			updateFields.push(`languages = $${paramCount}`);
			updateValues.push(updateInput.languages);
			paramCount++;
		}

		if (updateInput.image_url !== undefined) {
			updateFields.push(`image_url = $${paramCount}`);
			updateValues.push(updateInput.image_url);
			paramCount++;
		}

		if (updateInput.role !== undefined) {
			updateFields.push(`role = $${paramCount}`);
			updateValues.push(updateInput.role);
			paramCount++;
		}

		if (updateInput.instagram !== undefined) {
			updateFields.push(`instagram = $${paramCount}`);
			updateValues.push(updateInput.instagram);
			paramCount++;
		}

		if (updateInput.linkedin !== undefined) {
			updateFields.push(`linkedin = $${paramCount}`);
			updateValues.push(updateInput.linkedin);
			paramCount++;
		}

		if (updateInput.active !== undefined) {
			updateFields.push(`active = $${paramCount}`);
			updateValues.push(updateInput.active);
			paramCount++;
		}

		updateFields.push(`updated_at = NOW()`);

		updateValues.push(memberId);

		const results = await database.query({
			text: `
                UPDATE team_members
                SET ${updateFields.join(", ")}
                WHERE id = $${paramCount}
                RETURNING *
                ;`,
			values: updateValues,
		});

		return results.rows[0];
	}

	async function validateUniqueEmail(
		email: string,
		excludeMemberId?: string,
	) {
		const results = await database.query({
			text: `
                SELECT 
                    email
                FROM
                    team_members
                WHERE
                    LOWER(email) = LOWER($1)
                    ${excludeMemberId ? "AND id != $2" : ""}
                ;`,
			values: excludeMemberId ? [email, excludeMemberId] : [email],
		});
		if (results.rowCount > 0) {
			throw new ValidationError({
				message:
					"O endereço de e-mail informado já está sendo utilizado.",
				action: "Utilize outro e-mail para realizar a operação",
			});
		}
	}

	async function validateUniqueOabNumber(
		oabNumber: string,
		excludeMemberId?: string,
	) {
		const results = await database.query({
			text: `
                SELECT 
                    oab_number
                FROM
                    team_members
                WHERE
                    LOWER(oab_number) = LOWER($1)
                    ${excludeMemberId ? "AND id != $2" : ""}
                ;`,
			values: excludeMemberId
				? [oabNumber, excludeMemberId]
				: [oabNumber],
		});
		if (results.rowCount > 0) {
			throw new ValidationError({
				message: "O número da OAB informado já está sendo utilizado.",
				action: "Utilize outro número da OAB para realizar a operação",
			});
		}
	}
}

async function deactivate(memberId: string): Promise<TeamMemberRecord> {
	const existingMember = await findOneById(memberId);

	if (!existingMember.active) {
		throw new ValidationError({
			message: "Este membro da equipe já está inativo.",
			action: "Verifique se o membro selecionado está ativo antes de desativá-lo.",
		});
	}

	const results = await database.query({
		text: `
			UPDATE team_members
			SET 
				active = false,
				updated_at = NOW()
			WHERE id = $1
			RETURNING *
			;`,
		values: [memberId],
	});

	return results.rows[0];
}

async function findImageUsageCount(imageUrl: string): Promise<number> {
	const results = await database.query({
		text: `
            SELECT 
                COUNT(*) as count
            FROM
                team_members
            WHERE
                image_url = $1
            ;`,
		values: [imageUrl],
	});

	return parseInt(results.rows[0].count);
}

async function findManyByIds(memberIds: string[]): Promise<TeamMemberRecord[]> {
	if (!memberIds || memberIds.length === 0) {
		return [];
	}

	const results = await database.query({
		text: `
			SELECT
				*
			FROM
				team_members
			WHERE
				id = ANY($1)
			ORDER BY
				name ASC
			;`,
		values: [memberIds],
	});

	return results.rows;
}

const teamMember = {
	findAll,
	findOneById,
	findManyByIds,
	create,
	update,
	deactivate,
	findImageUsageCount,
};
export default teamMember;
