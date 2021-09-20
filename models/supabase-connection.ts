import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ImageInfoObj } from "../types";

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
}

const supabase = new SupabaseConnection();

export default supabase;
