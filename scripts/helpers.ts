import { stat } from "fs/promises";
import sharp from "sharp";

import { IMG_CDN_URL } from "../config";

require("isomorphic-fetch");

export const IMG_FILENAME_PATTERN = /JE-(?<fileId>\w{6})\.\w+/;

export async function isOnStorage(filename: string): Promise<boolean> {
	const response = await fetch(`${IMG_CDN_URL}/${filename}`);

	return response.status == 200;
}

/**
 * Checks if a file is a image
 */
export function isImage(filename: string): boolean {
	return /\.(jpe?g|png)/i.test(filename);
}

/**
 * Checks if a image file is properly named.
 * That is: JE-xxxxxx
 */
export function isJEImage(filename: string): boolean {
	return IMG_FILENAME_PATTERN.test(filename);
}

export async function metadata(filepath: string) {
	const dd = await sharp(filepath).metadata();
	const lastModifiedTime = (await stat(filepath)).mtime;
	const { width, height } = dd;

	return {
		width,
		height,
		lastModifiedTime,
	};
}
