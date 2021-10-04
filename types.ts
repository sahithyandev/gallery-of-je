export const ImageCategoryValues: string[] = [
	"sports",
	"wallpapers",
	"tv-shows",
	"kollywood",
	"others",
];

export type ImageCategory =
	| "sports"
	| "wallpapers"
	| "tv-shows"
	| "kollywood"
	| "others";

export const ImageCategoryLocalValues: string[] = [
	"all",
	...ImageCategoryValues,
];

export type ImageCategoryLocal = "all" | ImageCategory;

export interface ImageInfoObj {
	downloadFilename: string;
	width: number;
	height: number;
	downloadCount: number;
	addedOn: Date;
	category: ImageCategory;
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
	category: ImageCategory;
}
