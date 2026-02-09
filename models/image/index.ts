import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import webserver from "infra/webserver";
import { UploadResult, UploadOptions } from "./types";

const DEFAULT_MAX_SIZE_MB = 15;
const DEFAULT_ALLOWED_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

async function uploadFile(
	file: File,
	options: UploadOptions,
): Promise<UploadResult> {
	const {
		entityType,
		maxSizeInMB = DEFAULT_MAX_SIZE_MB,
		allowedTypes = DEFAULT_ALLOWED_TYPES,
	} = options;

	validateFileType(file, allowedTypes);
	validateFileSize(file, maxSizeInMB);

	const timestamp = Date.now();
	const extension = path.extname(file.name);
	const filename = `${timestamp}${extension}`;

	const subDir = getSubDirectory(entityType);
	const relativePath = `${subDir}/${filename}`;

	await saveFileToDisk(file, subDir, filename);

	return {
		filename,
		path: relativePath,
		url: getPublicUrl(relativePath),
	};
}

async function deleteFile(relativePath: string): Promise<void> {
	const filePath = path.join(process.cwd(), "public", relativePath);

	try {
		await unlink(filePath);
	} catch (error) {
		console.error("Erro ao deletar arquivo:", error);
		throw new Error("Não foi possível deletar o arquivo");
	}
}

function getPublicUrl(relativePath: string): string {
	return `${webserver.origin}/${relativePath}`;
}

function validateFileType(file: File, allowedTypes: string[]): void {
	if (!allowedTypes.includes(file.type)) {
		throw new Error(
			`Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(", ")}`,
		);
	}
}

function validateFileSize(file: File, maxSizeInMB: number): void {
	const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

	if (file.size > maxSizeInBytes) {
		throw new Error(
			`Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`,
		);
	}
}

function getSubDirectory(entityType: string): string {
	const directories: Record<string, string> = {
		team_member: "assets/images/teamMembers",
		blog_post: "assets/images/blog",
	};

	return directories[entityType] || "assets/images/other";
}

async function saveFileToDisk(
	file: File,
	subDir: string,
	filename: string,
): Promise<void> {
	const uploadDir = path.join(process.cwd(), "public", subDir);
	const filePath = path.join(uploadDir, filename);

	await mkdir(uploadDir, { recursive: true });

	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);

	await writeFile(filePath, buffer);
}

const image = {
	uploadFile,
	deleteFile,
	getPublicUrl,
};

export default image;
