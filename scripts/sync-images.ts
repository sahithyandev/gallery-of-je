import { readdir, rename, stat } from "fs/promises";
import { join, extname, sep } from "path";

import sharp from "sharp";

import supabase from "../models/supabase-connection";
import { ImageCategory, ImageInfoObj } from "../types";
import { IMAGES_DIR } from "../config";

const CMD_OPTIONS = {
	NO_RENAME: "--no-rename",
	NO_UPLOAD: "--no-upload",
	NO_VERCEL_DEPLOY: "--no-vercel-deploy",
	DRY: "--dry",
};

const CHARACTERS = {
	alphabets: "abcdefghijklmnopqrstuvwxyz",
	numbers: "0123456789",
};

function random(from = 0, to = 1): number {
	return Math.random() * (to - from) + from;
}

function randomString(
	length: number,
	charactersToUse: string = CHARACTERS.alphabets.concat(CHARACTERS.numbers),
	except: string[] = []
) {
	let stringToReturn = "";

	for (let i = 0; i < length; i++) {
		stringToReturn = stringToReturn.concat(
			charactersToUse.charAt(random(0, charactersToUse.length))
		);
	}

	if (except.includes(stringToReturn)) {
		return randomString(length, charactersToUse, except);
	}

	return stringToReturn;
}

let alreadyUsedFileIds = [];

async function renameFile(imgFilePath: string, NO_RENAME: boolean) {
	const fileId = randomString(
		6,
		CHARACTERS.numbers + CHARACTERS.alphabets,
		alreadyUsedFileIds
	);
	alreadyUsedFileIds.push(fileId);

	const fileExtension = extname(imgFilePath);
	const imgFolderPath = imgFilePath.split(sep).slice(0, -1).join(sep);
	const newImgFilePath = join(imgFolderPath, `JE-${fileId}${fileExtension}`);

	console.log(`RENAME:`, imgFilePath, "--->", newImgFilePath);

	if (!NO_RENAME) {
		await rename(imgFilePath, newImgFilePath);
	}

	return newImgFilePath;
}

interface ImageFileObj {
	name: string;
	category: ImageCategory;
}

// TODO upload each file after renaming
(async () => {
	const cmdParams = process.argv.slice(2);
	const DRY = cmdParams.includes(CMD_OPTIONS.DRY);
	const NO_RENAME = DRY || cmdParams.includes(CMD_OPTIONS.NO_RENAME);
	const NO_UPLOAD = DRY || cmdParams.includes(CMD_OPTIONS.NO_UPLOAD);
	const NO_VERCEL_DEPLOY =
		DRY || cmdParams.includes(CMD_OPTIONS.NO_VERCEL_DEPLOY);

	if (DRY) {
		console.warn(
			"INFO",
			`${CMD_OPTIONS.DRY} has been passed. This will turn on the dry mode.`
		);
	}

	if (NO_RENAME) {
		console.warn(
			"INFO",
			`${CMD_OPTIONS.NO_RENAME} has been passed. This will keep the script from renaming any files.`
		);
	}

	if (NO_UPLOAD) {
		console.warn(
			"INFO",
			`${CMD_OPTIONS.NO_UPLOAD} has been passed. This will keep the script from uploading any files to the server.`
		);
	}

	if (NO_VERCEL_DEPLOY) {
		console.warn(
			"INFO",
			`${CMD_OPTIONS.NO_VERCEL_DEPLOY} has been passed. This will keep the script from calling the Vercel deploy hook.`
		);
	}

	let imageFiles: ImageFileObj[] = [];
	let imageCategoryFolders: ImageCategory[] = [];

	try {
		imageCategoryFolders = (await readdir(IMAGES_DIR)) as ImageCategory[];
		console.log(
			`Found ${
				imageCategoryFolders.length
			} categories (${imageCategoryFolders.join(", ")})`
		);
	} catch (err) {
		console.log(err);
		console.log(
			`Seems like you don't have the IMAGES_DIR (${IMAGES_DIR}) setup`
		);
	}

	// get all images
	for (const category of imageCategoryFolders) {
		try {
			const files = await readdir(join(IMAGES_DIR, category));
			const images = files.filter((fileName) => {
				// test if its a image
				return /\.(jpe?g|png)$/i.test(fileName);
			});
			images.forEach((image) => {
				imageFiles.push({ name: image, category });
			});

			console.log(`Found ${images.length} images under ${category}`);
		} catch (err) {
			console.log(err);
			console.log(
				`Seems like you don't have the IMAGES_DIR (${IMAGES_DIR}) setup`
			);
		}
	}

	console.log(`Found ${imageFiles.length} images`);

	const newImages = [];
	// validate names
	const validatedImgFiles: ImageFileObj[] = [];
	for (const imgFileObj of imageFiles) {
		const IMG_FILENAME_PATTERN = /JE-(?<fileId>\w{6})\.\w+/;
		const imgFile = imgFileObj.name;
		const fullFilePath = join(IMAGES_DIR, imgFileObj.category, imgFile);

		if (!IMG_FILENAME_PATTERN.test(imgFile)) {
			const newImgFileName = await renameFile(fullFilePath, NO_RENAME);

			newImages.push(imgFile);
			validatedImgFiles.push({ ...imgFileObj, name: newImgFileName });
		} else {
			const fileId = imgFile.match(IMG_FILENAME_PATTERN).groups.fileId;

			alreadyUsedFileIds.push(fileId);
			validatedImgFiles.push({
				...imgFileObj,
				name: fullFilePath,
			});
		}
	}

	// upload images to storage
	if (!NO_UPLOAD) {
		const imageInfoArr: ImageInfoObj[] = await Promise.all(
			validatedImgFiles.map(async (fileObj) => {
				const file = fileObj.name;
				// upload storage
				var fileName;
				try {
					fileName = await supabase.uploadImage(file);
				} catch (e) {
					console.log(`Error occured (${file})`, e);
				}

				const lastModTime = (await stat(file)).mtime;
				const { width, height } = await sharp(file).metadata();
				return {
					downloadFilename: fileName,
					width,
					height,
					addedOn: lastModTime,
					category: fileObj.category,
				} as ImageInfoObj;
			})
		);

		console.log("should upload now");

		// add to database
		try {
			await supabase.addImageInfo(imageInfoArr);
		} catch (e) {
			console.log(e);
		}

		// vercel deploy
		if (!NO_VERCEL_DEPLOY) {
			require("isomorphic-fetch");
			if (newImages.length > 0) {
				console.log("Triggering new vercel deploy...");
				fetch(process.env.IMAGES_ADDED_DEPLOY_HOOK);
			}
		}
	}
})();
