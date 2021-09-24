import { NextApiHandler } from "next";

import supabase from "../../models/supabase-connection";

require("isomorphic-fetch");

const handler: NextApiHandler = async (req, res) => {
	const downloadFilename = req.query.filename as string;

	await supabase.incrementDownloadCount(downloadFilename);

	const imgixImageDownloadUrl = `https://gallery-of-je.imgix.net/${downloadFilename}?dl=${downloadFilename}`;
	res.redirect(imgixImageDownloadUrl);
};

export default handler;
