import { createClient, SupabaseClient } from "@supabase/supabase-js";

class SupabaseConnection {
	private client: SupabaseClient;
	static IMAGE_INFO_COLLECTION = "imageInfo";

	constructor() {
		const SUPABASE_URL = process.env.SUPABASE_URL || "";
		const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

		if ((SUPABASE_URL || SUPABASE_KEY) === "") {
			throw new Error("Required supabase values not found in process.env");
		}
		this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
		console.log("supabase init");
	}

	async getAllImages() {
		const { data, error } = await this.client
			.from(SupabaseConnection.IMAGE_INFO_COLLECTION)
			.select();

		if (error) {
			throw error;
		}

		return data;
	}
}

const supabase = new SupabaseConnection();

export default supabase;
