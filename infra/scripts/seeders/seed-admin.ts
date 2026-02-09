import user from "models/user";
import FEATURES from "infra/features";
require("dotenv").config({ path: ".env.development" });

const adminUserData = {
	name: "Admin",
	email: "admin@mm.com",
	password: "Password123@",
};

async function seedUser() {
	try {
		// Tenta encontrar, se der erro 404 = não existe
		await user.findOneByEmail(adminUserData.email);
		console.log("✅ Admin user já existe");
		return;
	} catch (error) {
		// Se não existe (erro 404), cria
		if (error.statusCode !== 404) {
			throw error; // Se for outro erro, relança
		}
	}

	// Cria o admin
	let adminUser = await user.create(adminUserData);

	adminUser = await user.setFeatures(
		adminUser.id,
		FEATURES.ADMIN_USER_FEATURES,
	);

	console.log("✅ Admin user criado com sucesso!");
	process.exit(0);
}

seedUser();
