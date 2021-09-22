import { ImageInfoObjLocal } from "../types";

export class ImageGalleryColumn {
	private items: ImageInfoObjLocal[];
	height: number;

	constructor(items?: ImageInfoObjLocal[]) {
		this.items = items || [];
		this.height = 0;
	}

	add(item: ImageInfoObjLocal) {
		this.items.push(item);
		this.height += item.displayHeight || item.height;
	}

	get images(): ImageInfoObjLocal[] {
		return this.items;
	}
}
