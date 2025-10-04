import { ORPCError } from "@orpc/server";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
];

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
	try {
		await fs.access(UPLOAD_DIR);
	} catch {
		await fs.mkdir(UPLOAD_DIR, { recursive: true });
	}
}

/**
 * Validate file upload
 */
export function validateFile(file: File) {
	if (!file) {
		throw new ORPCError("BAD_REQUEST");
	}

	if (file.size > MAX_FILE_SIZE) {
		throw new ORPCError("BAD_REQUEST");
	}

	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		throw new ORPCError("BAD_REQUEST");
	}
}

/**
 * Save uploaded file
 */
export async function saveFile(file: File, userId: string): Promise<string> {
	await ensureUploadDir();

	const ext = path.extname(file.name);
	const filename = `${userId}-${Date.now()}${ext}`;
	const filepath = path.join(UPLOAD_DIR, filename);

	const buffer = Buffer.from(await file.arrayBuffer());
	await fs.writeFile(filepath, buffer);

	return `/uploads/${filename}`;
}

/**
 * Delete file
 */
export async function deleteFile(filepath: string): Promise<void> {
	try {
		const fullPath = path.join(process.cwd(), "public", filepath);
		await fs.unlink(fullPath);
	} catch (error) {
		console.error("Error deleting file:", error);
	}
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
	return filename
		.replace(/[^a-zA-Z0-9._-]/g, "_")
		.replace(/_{2,}/g, "_")
		.toLowerCase();
}
