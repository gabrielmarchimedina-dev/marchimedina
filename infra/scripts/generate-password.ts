import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const lengthArg = Number(process.argv[2] ?? 16);
const length = Number.isFinite(lengthArg) ? Math.max(8, lengthArg) : 16;
const saltRoundsArg = Number(process.argv[3] ?? 10);
const saltRounds = Number.isFinite(saltRoundsArg)
	? Math.max(4, Math.min(15, saltRoundsArg))
	: 10;

const plain = randomBytes(Math.ceil(length * 1.5))
	.toString("base64")
	.replace(/[^a-zA-Z0-9]/g, "")
	.slice(0, length);

const hash = bcrypt.hashSync(plain, saltRounds);

console.log("plain:", plain);
console.log("hash:", hash);
