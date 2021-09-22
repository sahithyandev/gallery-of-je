export interface ImageInfoObj {
	downloadFilename: string;
	width: number;
	height: number;
	downloadCount: number;
	addedOn: Date;
}

export interface ImageInfoObjLocal {
	downloadFilename: string;
	downloadUrl: string;
	imageUrl: string;
	thumbnailUrl: string;
	width: number;
	height: number;
	displayWidth?: number;
	displayHeight?: number;
}
