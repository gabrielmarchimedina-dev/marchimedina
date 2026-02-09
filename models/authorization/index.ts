import { PublicUserRecord, UserRecord } from "models/user/types";

function can(user: UserRecord | PublicUserRecord, feature: string): boolean {
	let authorized = false;

	if (user.features.includes(feature)) {
		authorized = true;
	}
	return authorized;
}

const authorization = {
	can,
};

export default authorization;
