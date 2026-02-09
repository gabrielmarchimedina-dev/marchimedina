import email from "infra/email";
import { PublicUserRecord } from "models/user/types";
import { UserActivationRecord } from "./types";
import database from "infra/database";
import webserver from "infra/webserver";
import user from "models/user";
import { UserFirstPasswords } from "models/user/types";
import authorization from "models/authorization";
import { ForbiddenError, NotFoundError, ValidationError } from "infra/errors";
import FEATURES from "infra/features";

const EXPIRATION_IN_MILLISECONDS = 2 * 24 * 60 * 60 * 1000; // 2 days

async function findOneValidById(
	tokenId: string,
): Promise<UserActivationRecord> {
	const activationTokenObject = await runSelectQuery(tokenId);

	return activationTokenObject;

	async function runSelectQuery(
		tokenId: string,
	): Promise<UserActivationRecord> {
		const results = await database.query({
			text: `
				SELECT
					*
				FROM
					password_creation_tokens
				WHERE
					id = $1
					AND expires_at > NOW()
					AND used_at IS NULL
				LIMIT 1
			;`,
			values: [tokenId],
		});
		if (results.rowCount === 0) {
			throw new NotFoundError({
				message:
					"O token de ativação utilizado não foi encontrado no sistema ou expirou.",
				action: "Faça um novo cadastro.",
			});
		}
		return results.rows[0];
	}
}

async function create(userId: string): Promise<UserActivationRecord> {
	const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

	const newToken = await runInsertQuery(userId, expiresAt);
	return newToken;

	async function runInsertQuery(
		userId: string,
		expiresAt: Date,
	): Promise<UserActivationRecord> {
		const results = await database.query({
			text: `
                        INSERT INTO
                            password_creation_tokens (user_id, expires_at)
                        VALUES
                            ($1, $2)
                        RETURNING
                            *
                    ;`,
			values: [userId, expiresAt],
		});
		return results.rows[0];
	}
}

async function sendEmailToUser(
	user: PublicUserRecord,
	activationToken: UserActivationRecord,
): Promise<void> {
	await email.send({
		from: "MarchiMedina <contato@marchimedina.com.br>",
		to: `${user.email}`,
		subject: "Finalize seu cadastro no MarchiMedina",
		text: `${user.name}, clique no link abaixo para finalizar seu cadastro no Marchi Medina.
        
${webserver.origin}/admin/cadastro/ativar/${activationToken.id}
        
Atenciosamente.
`,
	});
}

async function markTokenAsUsed(
	activationTokenId: string,
): Promise<UserActivationRecord> {
	const usedActivationToken = await runUpdateQuery(activationTokenId);
	return usedActivationToken;

	async function runUpdateQuery(
		activationTokenId: string,
	): Promise<UserActivationRecord> {
		const results = await database.query({
			text: `
				UPDATE
					password_creation_tokens
				SET
					used_at = timezone('UTC', now()),
					updated_at = timezone('UTC', now())
				WHERE
					id = $1
				RETURNING
					*
			;`,
			values: [activationTokenId],
		});
		return results.rows[0];
	}
}

async function activateUserByUserId(
	userId: string,
	userFirstPasswords: UserFirstPasswords,
): Promise<PublicUserRecord> {
	if (!userFirstPasswords.password || !userFirstPasswords.confirmPassword) {
		throw new ValidationError({
			message: "É preciso que seja fornecida a senha.",
			action: "Digite as senhas para continuar.",
		});
	}

	const userToActivate = await user.findOneById(userId);

	if (
		!authorization.can(userToActivate, FEATURES.LIST.READ_ACTIVATION_TOKEN)
	) {
		throw new ForbiddenError({
			message: "Você não pode mais utilizar tokens de ativação",
			action: "Entre em contato com o suporte.",
		});
	}
	let activatedUser: PublicUserRecord;

	activatedUser = await user.createFirstPassword(userId, userFirstPasswords);

	activatedUser = await user.setFeatures(
		userId,
		FEATURES.DEFAULT_USER_FEATURES,
	);
	return activatedUser;
}

const activation = {
	create,
	sendEmailToUser,
	findOneValidById,
	markTokenAsUsed,
	activateUserByUserId,
	EXPIRATION_IN_MILLISECONDS,
};

export default activation;
