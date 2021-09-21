import { readFile } from "fs/promises";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ImageInfoObj } from "../types";

require("dotenv").config();

class SupabaseConnection {
	private client: SupabaseClient;
	static IMAGE_INFO_COLLECTION = "imageInfo";
	static PUBLIC_IMAGE_STORAGE =
		"https://erwfxmftkzktexefxtdy.supabase.in/storage/v1/object/public/images";

	constructor() {
		const SUPABASE_URL = process.env.SUPABASE_URL || "";
		const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

		if ((SUPABASE_URL || SUPABASE_KEY) === "") {
			throw new Error("Required supabase values not found in process.env");
		}
		this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
		console.log("supabase init");
	}

	async getAllImages(): Promise<ImageInfoObj[]> {
		const { data, error } = await this.client
			.from<ImageInfoObj>(SupabaseConnection.IMAGE_INFO_COLLECTION)
			.select();

		if (error) {
			throw error;
		}

		return data;
	}

	imageUrl(downloadFilename: string) {
		return `${SupabaseConnection.PUBLIC_IMAGE_STORAGE}/${downloadFilename}`;
	}

	async incrementDownloadCount(downloadFilename: string) {
		const { error } = await this.client.rpc("image_downloaded", {
			download_filename: downloadFilename,
		});

		if (error) throw error;
	}

	async hasImageAlreadyUploaded(imgFilePath: string): Promise<boolean> {
		const filename = imgFilePath.split("/").reverse()[0];
		const { data, error } = await this.client.storage
			.from("images")
			.list(null, {
				limit: 100,
			});

		if (error) throw error;

		return data
			.map((fileOnCloud) => {
				return fileOnCloud.name;
			})
			.includes(filename);
	}

	async uploadImage(imageFilePath: string): Promise<string> {
		const filename = imageFilePath.split("/").reverse()[0];

		if (await this.hasImageAlreadyUploaded(imageFilePath)) return filename;

		const fileExtension = filename.split(".").reverse()[0];
		const fileMimeType = (() => {
			if (fileExtension.match(/jpe?g/)) return "image/jpeg";
			return `image/${fileExtension}`;
		})();

		const fileContent = await readFile(imageFilePath);
		const { error } = await this.client.storage
			.from("images")
			.upload(filename, fileContent, {
				contentType: fileMimeType,
			});

		if (error) throw error;

		console.log("uploaded-image", filename);
		return filename;
	}

	async addImageInfo(imageInfoObjArr: ImageInfoObj[]) {
		const { data, error } = await this.client
			.from<ImageInfoObj>(SupabaseConnection.IMAGE_INFO_COLLECTION)
			.upsert(imageInfoObjArr);

		if (error) throw error;

		console.log(`added ${data.length} items to imageInfo`);

		return data;
	}
}

const supabase = new SupabaseConnection();

export default supabase;
