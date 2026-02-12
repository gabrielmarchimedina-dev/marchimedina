import user from "models/user";
import FEATURES from "infra/features";
require("dotenv").config({ path: ".env.development" });

const usersData = [
	{ name: "User 1", email: "user1@mm.com", password: "Password123@" },
	{ name: "User 2", email: "user2@mm.com", password: "Password123@" },
	{ name: "User 3", email: "user3@mm.com", password: "Password123@" },
];

async function seedUsers() {
	for (const userData of usersData) {
		try {
			await user.findOneByEmail(userData.email);
			console.log(`✅ ${userData.email} já existe`);
			continue;
		} catch (error) {
			if (error.statusCode !== 404) {
				throw error;
			}
		}

		let newUser = await user.create(userData);
		await user.setFeatures(newUser.id, FEATURES.DEFAULT_USER_FEATURES);
		console.log(`✅ ${userData.email} criado com sucesso!`);
	}

	process.exit(0);
}

seedUsers();
