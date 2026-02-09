import database from "infra/database";
import { ValidationError } from "infra/errors";
import {
	CreateUserInput,
	UserRecord,
	PublicUserRecord,
	UpdateUserInput,
	UserFirstPasswords,
	UserUpdatePassword,
} from "./types";
import { NotFoundError } from "infra/errors";
import password from "models/password";
import FEATURES from "infra/features";
import crypto from "crypto";

async function findAll(): Promise<PublicUserRecord[]> {
	const usersFound = await runSelectQuery();
	return usersFound;

	async function runSelectQuery() {
		const results = await database.query({
			text: `
				SELECT
					id, name, email, features, created_at, updated_at
				FROM
					users
				;`,
		});
		return results.rows;
	}
}

async function findOneById(id: string): Promise<PublicUserRecord | null> {
	const userFound = await runSelectQuery(id);
	return userFound;

	async function runSelectQuery(id: string) {
		const results = await database.query({
			text: `
				SELECT
					id, name, email, features, created_at, updated_at
				FROM
					users
				WHERE
					id = $1
				LIMIT 1
			;`,
			values: [id],
		});
		await validateUserByRowCount(results.rowCount);
		return results.rows[0];
	}

	async function validateUserByRowCount(resultRowsNumber: number) {
		if (resultRowsNumber === 0) {
			throw new NotFoundError({
				message: "O id informado não foi encontrado no sistema.",
				action: "Verifique se o id informado está correto.",
			});
		}
	}
}

async function findOneByEmail(email: string): Promise<UserRecord | null> {
	const userFound = await runSelectQuery(email);
	return userFound;

	async function runSelectQuery(email: string) {
		const results = await database.query({
			text: `
				SELECT
					id, name, email, password, features, created_at, updated_at
				FROM
					users
				WHERE
					email = $1
				LIMIT 1
			;`,
			values: [email],
		});
		await validateUserByRowCount(results.rowCount);
		return results.rows[0];
	}

	async function validateUserByRowCount(resultRowsNumber: number) {
		if (resultRowsNumber === 0) {
			throw new NotFoundError({
				message: "O email informado não foi encontrado no sistema.",
				action: "Verifique se o id informado está correto.",
			});
		}
	}
}

async function create(
	userInputValues: CreateUserInput,
): Promise<PublicUserRecord> {
	await validateUniqueEmail(userInputValues.email);
	if (!userInputValues.password) {
		userInputValues.password = generateRandomPassword();
	}
	await hashPasswordInObject(userInputValues);
	injectDefaultFeaturesInObject(userInputValues);
	const newUser = await runInsertQuery(userInputValues);

	return newUser;

	async function runInsertQuery(userInputValues: CreateUserInput) {
		const results = await database.query({
			text: `
                INSERT INTO
                    users (name, email, password, features)
                VALUES
                    ($1, $2, $3, $4)
                RETURNING
                    id, name, email, features, created_at, updated_at
            ;`,
			values: [
				userInputValues.name,
				userInputValues.email,
				userInputValues.password,
				userInputValues.features,
			],
		});

		return results.rows[0];
	}

	function injectDefaultFeaturesInObject(userInputValues: CreateUserInput) {
		userInputValues.features = [FEATURES.LIST.READ_ACTIVATION_TOKEN];
	}

	function generateRandomPassword() {
		// Gera string aleatória de 32 caracteres
		return crypto.randomBytes(16).toString("hex");
	}
}

async function update(
	id: string,
	userInputValues: UpdateUserInput,
): Promise<PublicUserRecord> {
	const currentUser = await findOneById(id);

	if (userInputValues.email && userInputValues.email !== currentUser.email) {
		await validateUniqueEmail(
			userInputValues.email,
			"Utilize outro endereço de e-mail para realizar a atualização.",
		);
	}

	const userWithNewValues = {
		...currentUser,
		...userInputValues,
	};

	const updatedUser = await runUpdateQuery(userWithNewValues);

	return updatedUser;

	async function runUpdateQuery(
		userWithNewValues: PublicUserRecord,
	): Promise<PublicUserRecord> {
		const results = await database.query({
			text: `
				UPDATE
					users
				SET
					name = $2,
					email = $3,
					updated_at = timezone('utc', now())
				WHERE
					id = $1
				RETURNING
					id, name, email, features, created_at, updated_at
				;`,
			values: [
				userWithNewValues.id,
				userWithNewValues.name,
				userWithNewValues.email,
			],
		});
		return results.rows[0];
	}
}

async function createFirstPassword(
	userId: string,
	userFirstPasswords: UserFirstPasswords,
): Promise<PublicUserRecord> {
	// if (userFirstPasswords.password !== userFirstPasswords.confirmPassword) {
	// 	throw new ValidationError({
	// 		message: "As senhas informadas não coincidem.",
	// 		action: "Verifique as senhas informadas e tente novamente.",
	// 	});
	// }
	await validatePasswordConfirmation(
		userFirstPasswords.password,
		userFirstPasswords.confirmPassword,
	);

	const hashedPassword = await password.hash(userFirstPasswords.password);

	const updatedUser = await runUpdateQuery(userId, hashedPassword);
	return updatedUser;

	async function runUpdateQuery(
		userId: string,
		hashedPassword: string,
	): Promise<PublicUserRecord> {
		const results = await database.query({
			text: `
				UPDATE
					users
				SET
					password = $2,
					updated_at = timezone('utc', now())
				WHERE
					id = $1
				RETURNING
					id, name, email, features, created_at, updated_at
			;`,
			values: [userId, hashedPassword],
		});
		return results.rows[0];
	}
}

async function updatePassword(
	userId: string,
	userInputValues: UserUpdatePassword,
): Promise<PublicUserRecord> {
	await isPasswordProvided(userInputValues);
	await validateCurrentPassword(userId, userInputValues.currentPassword);
	await validatePasswordConfirmation(
		userInputValues.newPassword,
		userInputValues.confirmNewPassword,
	);
	const hashedNewPassword = await password.hash(userInputValues.newPassword);

	const updatedUser = await runUpdateQuery(userId, hashedNewPassword);
	return updatedUser;

	async function runUpdateQuery(
		userId: string,
		newPassword: string,
	): Promise<PublicUserRecord> {
		const results = await database.query({
			text: `
				UPDATE
					users
				SET
						password = $2,
						updated_at = timezone('utc', now())
				WHERE
					id = $1
				RETURNING
					id, name, email, features, created_at, updated_at
			;`,
			values: [userId, newPassword],
		});
		return results.rows[0];
	}

	async function isPasswordProvided(userInputValues: UserUpdatePassword) {
		if (
			!userInputValues ||
			!userInputValues.currentPassword ||
			!userInputValues.newPassword ||
			!userInputValues.confirmNewPassword
		) {
			throw new ValidationError({
				message: "Todos os campos de senha devem ser preenchidos.",
				action: "Preencha todos os campos e tente novamente.",
			});
		}
	}

	async function validateCurrentPassword(
		userId: string,
		currentPassword: string,
	) {
		const userRecord = await database.query({
			text: `
				SELECT
					password
				FROM
					users
				WHERE
					id = $1
				LIMIT 1
			;`,
			values: [userId],
		});
		const hashedPassword = userRecord.rows[0].password;
		const isPasswordValid = await password.compare(
			currentPassword,
			hashedPassword,
		);
		if (!isPasswordValid) {
			throw new ValidationError({
				message: "A senha atual informada está incorreta.",
				action: "Verifique a senha informada e tente novamente.",
			});
		}
	}
}

async function setFeatures(
	userId: string,
	features: string[],
): Promise<PublicUserRecord> {
	features = validationDefaultFeatures(features);
	features = validateManagerCreation(features);
	const updatedUser = await runUpdateQuery(userId, features);
	return updatedUser;

	async function runUpdateQuery(userId: string, features: string[]) {
		const results = await database.query({
			text: `
				UPDATE
					users
				SET
						features = $2,
						updated_at = timezone('utc', now())
				WHERE
					id = $1
				RETURNING
					id, name, email, features, created_at, updated_at
			;`,
			values: [userId, features],
		});
		return results.rows[0];
	}

	function validationDefaultFeatures(features: string[]) {
		if (features.length === 0) {
			features = FEATURES.DEFAULT_USER_FEATURES;
		} else {
			features = [
				...new Set([...features, ...FEATURES.DEFAULT_USER_FEATURES]),
			];
		}
		return features;
	}

	function validateManagerCreation(features: string[]) {
		if (
			features.includes(FEATURES.LIST.UPDATE_USER_FEATURES) &&
			!features.includes(FEATURES.LIST.ADMIN)
		) {
			features = FEATURES.MANAGER_USER_FEATURES;
		}
		return features;
	}
}

async function validateUniqueEmail(email: string, action?: string) {
	const results = await database.query({
		text: `
                SELECT 
                    email
                FROM
                    users
                WHERE
                    LOWER(email) = LOWER($1)
                ;`,
		values: [email],
	});
	if (results.rowCount > 0) {
		throw new ValidationError({
			message: "O endereço de e-mail informado já está sendo utilizado.",
			action: action ?? "Utilize outro e-mail para realizar a operação",
		});
	}
}

async function hashPasswordInObject(userInputValues: CreateUserInput) {
	const passwordToHash =
		userInputValues.password || password.generateRandom();
	const hashedPassword = await password.hash(passwordToHash);
	userInputValues.password = hashedPassword;
}

async function validatePasswordConfirmation(
	newPassword: string,
	confirmNewPassword: string,
) {
	if (newPassword !== confirmNewPassword) {
		throw new ValidationError({
			message: "As senhas informadas não coincidem.",
			action: "Verifique as senhas informadas e tente novamente.",
		});
	}
}

const user = {
	findAll,
	findOneById,
	findOneByEmail,
	create,
	update,
	createFirstPassword,
	updatePassword,
	setFeatures,
};

export default user;
