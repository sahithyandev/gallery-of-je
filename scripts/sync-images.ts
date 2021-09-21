import { readdir, rename } from "fs/promises";
import { join } from "path";

import sharp from "sharp";

import supabase from "../models/supabase-connection";
import { ImageInfoObj } from "../types";

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
	const newImgFilePath = join(IMAGES_DIR, `JE-${fileId}.${fileExtension}`);

	console.log("renaming", imgFilePath, "--->", newImgFilePath);

	await rename(imgFilePath, newImgFilePath);
	return newImgFilePath;
}

(async () => {
	let imageFiles;

	try {
		imageFiles = await readdir(IMAGES_DIR);
	} catch (err) {
		console.log(err);
		console.log(
			`Seems like you don't have the IMAGES_DIR (${IMAGES_DIR}) setup`
		);
	}

	//TODO add some error checking here
	// 1. filter the images
	console.log(`Found ${imageFiles.length} images`);

	// validate names
	const validatedImgFiles = [];
	for (const imgFile of imageFiles) {
		const IMG_FILENAME_PATTERN = /JE-(?<fileId>\w{6})\.\w+/;

		if (!IMG_FILENAME_PATTERN.test(imgFile)) {
			const newImgFileName = await renameFile(join(IMAGES_DIR, imgFile));
			validatedImgFiles.push(newImgFileName);
		} else {
			const fileId = imgFile.match(IMG_FILENAME_PATTERN).groups.fileId;

			alreadyUsedFileIds.push(fileId);
			validatedImgFiles.push(join(IMAGES_DIR, imgFile));
		}
	}

	// upload images to storage
	const imageInfoArr: ImageInfoObj[] = await Promise.all(
		validatedImgFiles.map(async (file) => {
			// upload storage
			const fileName = await supabase.uploadImage(file);

			const { width, height } = await sharp(file).metadata();
			return {
				downloadFilename: fileName,
				width,
				height,
			} as ImageInfoObj;
		})
	);

	// add to database
	await supabase.addImageInfo(imageInfoArr);
})();
