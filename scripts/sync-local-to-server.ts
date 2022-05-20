import { readdir, stat } from "fs/promises";
import { join, extname, sep } from "path";

import supabase from "../models/supabase-connection";
import { ImageCategory, ImageInfoObj } from "../types";
import { IMAGES_DIR, IMG_CDN_URL } from "../config";
import sharp from "sharp";
require("isomorphic-fetch");

interface ImageFileObj {
	name: string;
	category: ImageCategory;
	path: string;
	isOnDatabase?: boolean;
	isOnStorage?: boolean;
}

const CMD_OPTIONS = {
	NO_VERCEL_DEPLOY: "--no-vercel-deploy",
};

async function isOnStorage(filename: string): Promise<boolean> {
	const response = await fetch(`${IMG_CDN_URL}/${filename}`);

	return response.status == 200;
}

(async () => {
	const cmdParams = process.argv.slice(2);
	const NO_VERCEL_DEPLOY = cmdParams.includes(CMD_OPTIONS.NO_VERCEL_DEPLOY);

	if (NO_VERCEL_DEPLOY) {
		console.warn(
			"INFO",
			`${CMD_OPTIONS.NO_VERCEL_DEPLOY} has been passed. This will keep the script from calling the Vercel deploy hook.`
		);
	}

	// load all local files
	let imageFiles: ImageFileObj[] = [];
	let ImageCategoryFolders: ImageCategory[] = [];

	try {
		ImageCategoryFolders = (await readdir(IMAGES_DIR)) as ImageCategory[];
		console.log(
			`Found ${
				ImageCategoryFolders.length
			} categories (${ImageCategoryFolders.join(", ")})`
		);
	} catch (err) {
		console.log(err);
		console.log(
			`Seems like you don't have the IMAGES_DIR (${IMAGES_DIR}) setup`
		);
		process.exit(1);
	}

	for (const category of ImageCategoryFolders) {
		try {
			const files = await readdir(join(IMAGES_DIR, category));
			const images = files
				.filter((filename) => {
					// test if its a image
					return /\.(jpe?g|png)/i.test(filename);
				})
				.filter((filename) => {
					// test if it matches JE-xxxxxx name
					return /JE-(?<fileId>\w{6}\.\w+)/.test(filename);
				});

			await Promise.all(
				images.map(async (image) => {
					imageFiles.push({
						name: image,
						category,
						path: join(IMAGES_DIR, category, image),
						isOnStorage: await isOnStorage(image),
						isOnDatabase: await supabase.isImageOnDatabase(image),
					});
				})
			);
		} catch (err) {
			console.log(err);
			console.log(
				`Seems like you don't have the IMAGES_DIR (${IMAGES_DIR}) setup`
			);
			process.exit(1);
		}
	}

	console.log(`Found ${imageFiles.length} images`);

	const notFoundOnDB = imageFiles.filter((img) => !img.isOnDatabase);
	const notFoundOnStorage = imageFiles.filter((img) => !img.isOnStorage);

	console.log(`${notFoundOnDB.length} are not found in the database`);
	console.log(`${notFoundOnStorage.length} are not found in the storage`);

	// upload to database
	if (notFoundOnDB.length != 0) {
		console.log("UPLOADING TO DATABASE start");
		await supabase.addImageInfo(
			await Promise.all(
				notFoundOnDB.map(async (file) => {
					const lastModTime = (await stat(file.path)).mtime;
					const { width, height } = await sharp(file.path).metadata();

					return {
						downloadFilename: file.name,
						width,
						height,
						addedOn: lastModTime,
						category: file.category,
					} as ImageInfoObj;
				})
			)
		);
		console.log("UPLOADING TO DATABASE end");
	}

	// upload to storage
	if (notFoundOnStorage.length != 0) {
		console.log("UPLOADING TO STORAGE start");
		await Promise.all(
			notFoundOnStorage.map(async (file) => {
				await supabase.uploadImage(file.path);
			})
		);
		console.log("UPLOADING TO STORAGE end");
	}

	if (!NO_VERCEL_DEPLOY) {
		console.log("Triggering new Vercel deploy");
		fetch(process.env.IMAGES_ADD_DEPLOY_HOOK);
	}
})();
