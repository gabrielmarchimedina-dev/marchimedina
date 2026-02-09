import user from "models/user";
import FEATURES from "infra/features";
require("dotenv").config({ path: ".env.development" });

const userData = {
	name: "User",
	email: "user@mm.com",
	password: "Password123@",
};

async function seedUser() {
	try {
		// Tenta encontrar, se der erro 404 = não existe
		await user.findOneByEmail(userData.email);
		console.log("✅ User já existe");
		return;
	} catch (error) {
		// Se não existe (erro 404), cria
		if (error.statusCode !== 404) {
			throw error; // Se for outro erro, relança
		}
	}

	// Cria o user
	let newUser = await user.create(userData);

	newUser = await user.setFeatures(
		newUser.id,
		FEATURES.DEFAULT_USER_FEATURES,
	);

	console.log("✅ User criado com sucesso!");
	process.exit(0);
}

seedUser();
