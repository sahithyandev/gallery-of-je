import { readdir, rename, stat } from "fs/promises";
import { join } from "path";

import sharp from "sharp";

import supabase from "../models/supabase-connection";
import { ImageCategory, ImageInfoObj } from "../types";

const IMAGES_DIR = join(__dirname, "./../images");
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

async function renameFile(imgFilePath: string) {
	const fileId = randomString(
		6,
		CHARACTERS.numbers + CHARACTERS.alphabets,
		alreadyUsedFileIds
	);
	alreadyUsedFileIds.push(fileId);

	const fileExtension = imgFilePath.split(".").reverse()[0];
	const imgFolderPath = imgFilePath.split("/").slice(0, -1).join("/");
	const newImgFilePath = join(imgFolderPath, `JE-${fileId}.${fileExtension}`);

	console.log("renaming", imgFilePath, "--->", newImgFilePath);

	await rename(imgFilePath, newImgFilePath);
	return newImgFilePath;
}

interface ImageFileObj {
	name: string;
	category: ImageCategory;
}

(async () => {
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
			const images = await readdir(join(IMAGES_DIR, category));
			images.forEach((image) => {
				imageFiles.push({ name: image, category });
			});

			console.log(`Found ${imageFiles.length} images under ${category}`);
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
			const newImgFileName = await renameFile(fullFilePath);

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
	const imageInfoArr: ImageInfoObj[] = await Promise.all(
		validatedImgFiles.map(async (fileObj) => {
			const file = fileObj.name;
			// upload storage
			const fileName = await supabase.uploadImage(file);

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

	// add to database
	await supabase.addImageInfo(imageInfoArr);

	// vercel deploy
	require("isomorphic-fetch");
	if (newImages.length > 0) {
		fetch(process.env.IMAGES_ADDED_DEPLOY_HOOK);
	}
})();
