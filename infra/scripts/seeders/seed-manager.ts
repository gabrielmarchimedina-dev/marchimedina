import user from "models/user";
import FEATURES from "infra/features";
require("dotenv").config({ path: ".env.development" });

const managerUserData = {
	name: "Manager",
	email: "manager@mm.com",
	password: "Password123@",
};

async function seedManager() {
	try {
		await user.findOneByEmail(managerUserData.email);
		console.log("✅ Manager já existe");
		return;
	} catch (error) {
		if (error.statusCode !== 404) {
			throw error;
		}
	}

	let managerUser = await user.create(managerUserData);

	await user.setFeatures(managerUser.id, FEATURES.MANAGER_USER_FEATURES);

	console.log("✅ Manager criado com sucesso!");
	process.exit(0);
}

seedManager();
