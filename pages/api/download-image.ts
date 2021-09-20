import { NextApiHandler } from "next";

import supabase from "../../models/supabase-connection";

require("isomorphic-fetch");

const handler: NextApiHandler = async (req, res) => {
	const downloadFilename = req.query.filename as string;
	const imageUrl = supabase.imageUrl(downloadFilename);

	const imageResponse = await fetch(imageUrl);

	if (!imageResponse.ok) {
		throw new Error(`Unexpected response ${imageResponse.statusText}`);
	}

	[
		"content-type",
		"etag",
		"cache-control",
		"access-control-allow-origin",
		"last-modified",
	].forEach((header) => {
		res.setHeader(header, imageResponse.headers.get(header));
	});
	res.status(200);

	const imageArrBuffer = await imageResponse.arrayBuffer();

	res.send(Buffer.from(imageArrBuffer));

	await supabase.incrementDownloadCount(downloadFilename);

	res.end();
};

export default handler;
