import { readdir } from "fs/promises";
import { join } from "path";

import supabase from "../models/supabase-connection";
import { ImageCategory, ImageInfoObj } from "../types";

import { IMAGES_DIR, IMG_CDN_URL } from "../config";
require("isomorphic-fetch");

interface ImageFileObj {
	name: string;
	category: ImageCategory;
}

const CMD_OPTIONS = {
	NO_LOCAL: "--no-local",
	NO_DB: "--no-db",
};

function checkIfAvailableOnServer(filename: string, debugNote: string) {
	fetch(`${IMG_CDN_URL}/${filename}`).then((response) => {
		if (response.status !== 200) {
			console.log(`No image is found at ${response.url}`, debugNote);
		}
	});
}

(async () => {
	const cmdParams = process.argv.slice(2);
	const NO_LOCAL = cmdParams.includes(CMD_OPTIONS.NO_LOCAL);
	const NO_DB = cmdParams.includes(CMD_OPTIONS.NO_DB);

	if (NO_LOCAL) {
		console.warn(
			"INFO",
			`${CMD_OPTIONS.NO_LOCAL} has been passed. This will keep the script from checking local files.`
		);
	}

	if (NO_DB) {
		console.warn(
			"INFO",
			`${CMD_OPTIONS.NO_DB} has been passed. This will keep the script from checking files on the database.`
		);
	}

	let imageFiles: ImageFileObj[] = [];
	let _imageFiles: string[] = [];
	if (!NO_LOCAL) {
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
					// test if its a image and if its
					return /JE-\w{6}.(jpe?g|png)/i.test(fileName);
				});
				images.forEach((image) => {
					imageFiles.push({ name: image, category });
					_imageFiles.push(image);
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

		console.log("");
		console.log("Checking if all the local files are on the server");
		console.log("");

		require("isomorphic-fetch");
		imageFiles.forEach((img) => {
			checkIfAvailableOnServer(img.name, "LOCALFILE");
		});
	}

	let imagesOnDB: ImageInfoObj[];
	let _imagesOnDB: string[];
	if (!NO_DB) {
		console.log("");
		console.log("Checking if all images on the database are on the server");
		console.log("");

		imagesOnDB = await supabase.getAllImages();
		_imagesOnDB = imagesOnDB.map((f) => f.downloadFilename);
		imagesOnDB.forEach((img) => {
			checkIfAvailableOnServer(img.downloadFilename, "DB");
		});

		const imagesOnStorageBucket = await supabase.getAllImagesInBucket();
		const _imagesOnStorageBucket = imagesOnStorageBucket.map((f) => f.name);
		if (imagesOnDB.length !== imagesOnStorageBucket.length) {
			console.log(
				`Storage bucket has ${imagesOnStorageBucket.length} images but the database has ${imagesOnDB.length} images`
			);

			_imagesOnDB.forEach((file) => {
				if (!_imagesOnStorageBucket.includes(file)) {
					console.log(`${file} is on the database, but not on the storage`);
				}
			});

			_imagesOnStorageBucket.forEach((file) => {
				if (!_imagesOnDB.includes(file)) {
					console.log(`${file} is on the storage, but not on the database`);
				}
			});
		}
	}

	if (!NO_DB && !NO_LOCAL) {
		if (imagesOnDB.length !== imageFiles.length) {
			console.log(
				`Local image count (${imageFiles.length}) doesn't match with the count on the database (${imagesOnDB.length})`
			);

			const _imageFiles = imageFiles.map((f) => f.name);

			imagesOnDB.forEach((file) => {
				if (!_imageFiles.includes(file.downloadFilename)) {
					console.log(`${file} is on the database, but not locally`);
					return;
				}

				const localFileCategory = imageFiles.find(
					(f) => f.name === file.downloadFilename
				).category;

				if (file.category !== localFileCategory) {
					console.log(
						`${file.downloadFilename} is found on the database ${file.category} and locally ${localFileCategory} but their categories doesn't match`
					);
					return;
				}
			});

			imageFiles.forEach((file) => {
				if (!_imagesOnDB.includes(file.name)) {
					console.log(`${file} is saved locally, but not on the database`);
					return;
				}

				const dbFileCategory = imagesOnDB.find(
					(f) => f.downloadFilename === file.name
				).category;

				if (file.category !== dbFileCategory) {
					console.log(
						`${file.name} is found on the database ${file.category} and locally ${dbFileCategory} but their categories doesn't match`
					);
				}
			});
		}
	}
})();
